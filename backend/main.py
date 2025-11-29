import os
import shutil
from typing import List, Literal
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing_extensions import TypedDict

try:
    __import__('pysqlite3')
    import sys
    sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')
    print("✅ Swapped sqlite3 for pysqlite3")
except ImportError:
    print("⚠️ pysqlite3 not found, using default sqlite3")

# LangChain Imports
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document
from langgraph.graph import END, StateGraph, START
from dotenv import load_dotenv

load_dotenv()

os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")
os.environ["TAVILY_API_KEY"] = os.getenv("TAVILY_API_KEY")

# --- APP SETUP ---
app = FastAPI()

# Allow React to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for simplicity in this demo
vectorstore = None
retriever = None

# --- LANGGRAPH SETUP (Same as before, wrapped in functions) ---

llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0)

# 1. State
class GraphState(TypedDict):
    question: str
    generation: str
    documents: List[str]
    web_search_needed: bool
    steps: List[str] # To track execution path for UI

# 2. Router & Grader Models
class RouteQuery(BaseModel):
    datasource: Literal["vectorstore", "web_search"] = Field(
        ..., description="Route user query to web search or vectorstore."
    )

class GradeDocuments(BaseModel):
    binary_score: str = Field(description="Relevance score 'yes' or 'no'")

# 3. Chains
structured_llm_router = llm.with_structured_output(RouteQuery)
route_chain = ChatPromptTemplate.from_messages([
    ("system", "You are an expert router. Use vectorstore for specific document context, otherwise web-search."),
    ("human", "{question}")
]) | structured_llm_router

structured_llm_grader = llm.with_structured_output(GradeDocuments)
grade_chain = ChatPromptTemplate.from_messages([
    ("system", "Grade relevance 'yes' or 'no'."),
    ("human", "Doc: {document} \n Question: {question}")
]) | structured_llm_grader

rag_chain = ChatPromptTemplate.from_template(
    "Answer based on context: {context} \n Question: {question}"
) | llm | StrOutputParser()

web_tool = TavilySearchResults(k=3)

# 4. Nodes
def retrieve(state):
    print("---RETRIEVE---")
    if not retriever:
        return {"documents": [], "question": state["question"], "steps": ["Error: No PDF loaded"]}
    docs = retriever.invoke(state["question"])
    return {"documents": docs, "question": state["question"], "steps": ["Retrieved PDF chunks"]}

def generate(state):
    print("---GENERATE---")
    gen = rag_chain.invoke({"context": state["documents"], "question": state["question"]})
    return {"generation": gen, "steps": ["Generated Answer"]}

def grade_documents(state):
    print("---GRADE---")
    filtered = []
    web_needed = False
    for d in state["documents"]:
        score = grade_chain.invoke({"question": state["question"], "document": d.page_content})
        if score.binary_score == "yes":
            filtered.append(d)
    
    if not filtered:
        web_needed = True
        step_log = "Grading: PDF irrelevant"
    else:
        step_log = "Grading: PDF relevant"
        
    return {"documents": filtered, "web_search_needed": web_needed, "steps": [step_log]}

def web_search(state):
    print("---WEB SEARCH---")
    docs = web_tool.invoke({"query": state["question"]})
    content = "\n".join([d["content"] for d in docs])
    return {"documents": [Document(page_content=content)], "steps": ["Searched Tavily API"]}

def route_question(state):
    print("---ROUTE---")
    source = route_chain.invoke({"question": state["question"]})
    if source.datasource == "web_search":
        return "web_search"
    return "vectorstore"

def decide_to_generate(state):
    if state["web_search_needed"]:
        return "web_search"
    return "generate"

# 5. Build Graph
workflow = StateGraph(GraphState)
workflow.add_node("web_search", web_search)
workflow.add_node("retrieve", retrieve)
workflow.add_node("grade_documents", grade_documents)
workflow.add_node("generate", generate)

workflow.add_conditional_edges(
    START, route_question,
    {"web_search": "web_search", "vectorstore": "retrieve"}
)
workflow.add_edge("retrieve", "grade_documents")
workflow.add_conditional_edges(
    "grade_documents", decide_to_generate,
    {"web_search": "web_search", "generate": "generate"}
)
workflow.add_edge("web_search", "generate")
workflow.add_edge("generate", END)

app_graph = workflow.compile()

# --- API ENDPOINTS ---

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global retriever, vectorstore
    
    # Save file temporarily
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Process PDF
    loader = PyPDFLoader(file_location)
    docs = loader.load()
    splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(chunk_size=1000, chunk_overlap=200)
    splits = splitter.split_documents(docs)
    
    # Init Vectorstore
    vectorstore = Chroma.from_documents(
        documents=splits,
        collection_name="rag-chroma",
        embedding=HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    )
    retriever = vectorstore.as_retriever()
    
    os.remove(file_location) # Cleanup
    return {"message": "PDF processed and vector store ready."}

class ChatRequest(BaseModel):
    query: str

@app.post("/chat")
async def chat(request: ChatRequest):
    if not request.query:
        raise HTTPException(status_code=400, detail="Query is empty")
    
    inputs = {"question": request.query}
    final_state = None
    
    # Run the graph
    # We collect all steps to show the user the "thought process"
    steps_log = []
    
    for output in app_graph.stream(inputs):
        for key, value in output.items():
            if "steps" in value:
                steps_log.extend(value["steps"])
            if "generation" in value:
                final_state = value
    
    return {
        "answer": final_state["generation"] if final_state else "Error generating response",
        "steps": steps_log
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)