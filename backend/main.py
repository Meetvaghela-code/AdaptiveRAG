# --- STARTUP DIAGNOSTICS ---
import sys
import os
print("--- SERVER STARTUP: BEGIN ---", flush=True)

# Standard Imports
import shutil
from typing import List, Literal
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing_extensions import TypedDict
from dotenv import load_dotenv

print("--- IMPORTS: STANDARD COMPLETE ---", flush=True)

# LangChain & AI Imports
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_tavily import TavilySearch
# from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document
from langgraph.graph import END, StateGraph, START

print("--- IMPORTS: LANGCHAIN COMPLETE ---", flush=True)

load_dotenv()

# --- APP SETUP ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
vectorstore = None
retriever = None

# --- LANGGRAPH SETUP ---
if not os.getenv("GOOGLE_API_KEY"):
    print("❌ CRITICAL: GOOGLE_API_KEY is missing", flush=True)
if not os.getenv("TAVILY_API_KEY"):
    print("❌ CRITICAL: TAVILY_API_KEY is missing", flush=True)

os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")
print("--- INITIALIZING AI MODELS ---", flush=True)
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0)

# 1. State
class GraphState(TypedDict):
    question: str
    generation: str
    documents: List[str]
    web_search_needed: bool
    steps: List[str]

# 2. Router & Grader Models
class RouteQuery(BaseModel):
    datasource: Literal["vectorstore", "web_search"] = Field(
        ..., description="Route user query to web search or vectorstore."
    )

class GradeDocuments(BaseModel):
    binary_score: str = Field(description="Relevance score 'yes' or 'no'")

# 3. Chains

# A. Router
structured_llm_router = llm.with_structured_output(RouteQuery)
route_chain = ChatPromptTemplate.from_messages([
    ("system", "You are an expert router. Use vectorstore for specific document context, otherwise web-search."),
    ("human", "{question}")
]) | structured_llm_router

# B. Grader
structured_llm_grader = llm.with_structured_output(GradeDocuments)
grade_chain = ChatPromptTemplate.from_messages([
    ("system", "Grade relevance 'yes' or 'no'. If the document contains keywords or semantic meaning related to the question, grade it as relevant."),
    ("human", "Doc: {document} \n Question: {question}")
]) | structured_llm_grader

# C. Rewriter (NEW: Optimization for better search)
rewrite_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a question re-writer that converts an input question to a better version that is optimized "
               "for web search. Look at the input and try to reason about the underlying semantic intent / meaning."),
    ("human", "Here is the initial question: \n\n {question} \n Formulate an improved question.")
])
question_rewriter = rewrite_prompt | llm | StrOutputParser()

# D. Generator (Updated for stricter adherence)
rag_chain = ChatPromptTemplate.from_template(
    """You are an assistant for question-answering tasks. 
    Use the following pieces of retrieved context to answer the question. 
    If you don't know the answer, just say that you don't know. 
    Use three sentences maximum and keep the answer concise.
    
    Context: {context} 
    
    Question: {question}
    
    Answer:"""
) | llm | StrOutputParser()

web_tool = TavilySearch(k=3,topics=["general"], api_key=os.getenv("TAVILY_API_KEY"))

# 4. Nodes

def retrieve(state):
    print("---RETRIEVE---", flush=True)
    if not retriever:
        return {"documents": [], "question": state["question"], "steps": ["Error: No PDF loaded"]}
    docs = retriever.invoke(state["question"])
    return {"documents": docs, "question": state["question"], "steps": ["Retrieved PDF chunks"]}

def generate(state):
    print("---GENERATE---", flush=True)
    gen = rag_chain.invoke({"context": state["documents"], "question": state["question"]})
    return {"generation": gen, "steps": ["Generated Answer"]}

def grade_documents(state):
    print("---GRADE---", flush=True)
    filtered = []
    web_needed = False
    for d in state["documents"]:
        score = grade_chain.invoke({"question": state["question"], "document": d.page_content})
        if score.binary_score == "yes":
            filtered.append(d)
    
    # If no relevant docs found, we set flag to transform query & search web
    if not filtered:
        web_needed = True
        step_log = "Grading: PDF irrelevant -> Needs Web Search"
    else:
        step_log = "Grading: PDF relevant"
        
    return {"documents": filtered, "web_search_needed": web_needed, "steps": [step_log]}

def transform_query(state):
    """
    Transform the query to produce a better question.
    This is called when PDF retrieval fails or when routing straight to web.
    """
    print("---TRANSFORM QUERY---", flush=True)
    question = state["question"]
    better_question = question_rewriter.invoke({"question": question})
    return {"question": better_question, "steps": [f"Optimized Query: {better_question}"]}

def web_search(state):
    print("---WEB SEARCH---", flush=True)
    try:
        docs = web_tool.invoke({"query": state["question"]})
        
        web_results = ""
        # Check if docs is a list (normal behavior) or a string (error/empty)
        if isinstance(docs, list):
            web_results = "\n".join([d.get("content", "") for d in docs if isinstance(d, dict)])
        elif isinstance(docs, str):
            web_results = docs
        else:
            web_results = str(docs)
            
        return {"documents": [Document(page_content=web_results)], "steps": ["Searched Tavily API"]}
    except Exception as e:
        print(f"WEB SEARCH ERROR: {str(e)}", flush=True)
        return {"documents": [Document(page_content="Could not retrieve web results.")], "steps": ["Web Search Failed"]}

def route_question(state):
    print("---ROUTE---", flush=True)
    
    # LOGIC UPDATE: If a PDF is loaded, prioritize checking it first.
    # The system will fallback to web search later if the document retrieval is irrelevant.
    if retriever is not None:
        print("---ROUTE: PDF LOADED -> VECTOR STORE---", flush=True)
        return "vectorstore"

    # If no PDF is loaded, use the LLM router (or just default to web search)
    source = route_chain.invoke({"question": state["question"]})
    if source.datasource == "web_search":
        return "web_search"
    return "vectorstore"

def decide_to_generate(state):
    if state["web_search_needed"]:
        # Optimization: If PDF failed, don't just search, REWRITE then search
        return "transform_query" 
    return "generate"

# 5. Build Graph
print("--- BUILDING GRAPH ---", flush=True)
workflow = StateGraph(GraphState)

workflow.add_node("web_search", web_search)
workflow.add_node("retrieve", retrieve)
workflow.add_node("grade_documents", grade_documents)
workflow.add_node("transform_query", transform_query) # NEW NODE
workflow.add_node("generate", generate)

# Logic Flow
# 1. Start -> Router
workflow.add_conditional_edges(
    START, route_question,
    {
        "web_search": "transform_query", # Optimization: Optimize query before web search
        "vectorstore": "retrieve"
    }
)

# 2. Retrieve -> Grade
workflow.add_edge("retrieve", "grade_documents")

# 3. Grade -> Decision
workflow.add_conditional_edges(
    "grade_documents", decide_to_generate,
    {
        "transform_query": "transform_query", # If PDF bad, optimize query first
        "generate": "generate"                # If PDF good, generate
    }
)

# 4. Transform -> Web Search
workflow.add_edge("transform_query", "web_search")

# 5. Web Search -> Generate
workflow.add_edge("web_search", "generate")

# 6. Generate -> End
workflow.add_edge("generate", END)

app_graph = workflow.compile()
print("--- GRAPH READY ---", flush=True)

# --- API ENDPOINTS ---

@app.get("/")
def read_root():
    return {"status": "Adaptive RAG Backend (Optimized) is running"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global retriever, vectorstore
    
    file_location = f"temp_{file.filename}"
    try:
        print(f"--- UPLOAD START: {file.filename} ---", flush=True)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        loader = PyPDFLoader(file_location)
        docs = loader.load()
        print(f"Loaded {len(docs)} pages", flush=True)
        
        # Optimization: Smaller chunks for better embedding precision
        splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(chunk_size=500, chunk_overlap=100)
        splits = splitter.split_documents(docs)
        print(f"Created {len(splits)} chunks", flush=True)
        
        print("Initializing FAISS VectorStore...", flush=True)
        # Optimization: Use BGE embeddings (Better than MiniLM)
        embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-base-en-v1.5")
        
        vectorstore = FAISS.from_documents(splits, embeddings)
        retriever = vectorstore.as_retriever()
        
        print("FAISS VectorStore ready", flush=True)
        
        os.remove(file_location)
        return {"message": "PDF processed and vector store ready."}
        
    except Exception as e:
        if os.path.exists(file_location):
            os.remove(file_location)
        print(f"UPLOAD ERROR: {str(e)}", flush=True)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

class ChatRequest(BaseModel):
    query: str

@app.post("/chat")
async def chat(request: ChatRequest):
    if not request.query:
        raise HTTPException(status_code=400, detail="Query is empty")
    
    inputs = {"question": request.query}
    final_state = None
    steps_log = []
    
    try:
        for output in app_graph.stream(inputs):
            for key, value in output.items():
                if "steps" in value:
                    steps_log.extend(value["steps"])
                if "generation" in value:
                    final_state = value
    except Exception as e:
        print(f"CHAT ERROR: {str(e)}", flush=True)
        raise HTTPException(status_code=500, detail=str(e))
    
    return {
        "answer": final_state["generation"] if final_state else "Error generating response",
        "steps": steps_log
    }

print("--- SERVER READY ---", flush=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
