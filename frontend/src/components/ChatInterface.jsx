import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowUp, FaPaperclip, FaRobot, FaUser, FaCircle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ChatInterface = () => {
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Ready. Upload a document or ask me anything." }
  ]);
  const [logs, setLogs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const logsRef = useRef(null);
  const messagesRef = useRef(null);

  // Scroll internal containers instead of calling element.scrollIntoView()
  // which can cause the browser to jump the whole page to the chat section on load.
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    
    // Simulate upload log immediately
    setLogs(prev => [...prev, { type: 'info', text: `Processing ${selectedFile.name}...` }]);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post(`${API_URL}/upload`, formData);
      setLogs(prev => [...prev, { type: 'success', text: "Vector Store Created." }]);
    } catch (error) {
      setLogs(prev => [...prev, { type: 'error', text: "Upload Failed." }]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, { query: userMsg });
      
      if(res.data.steps) {
        // Add delays for effect
        res.data.steps.forEach((step, i) => {
           setTimeout(() => {
               setLogs(prev => [...prev, { type: 'router', text: step }]);
           }, i * 300);
        });
      }
      setMessages(prev => [...prev, { role: 'ai', content: res.data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Server Error." }]);
    }
    setLoading(false);
  };

  return (
    <div className="container py-5" id="demo">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="chat-window rounded-4 overflow-hidden d-flex flex-column flex-lg-row"
        style={{ height: '80vh', border: '1px solid #333' }}
      >
        
        {/* Sidebar / Terminal Logs */}
        <div className="col-lg-4 d-none d-lg-flex flex-column p-4 border-end border-secondary bg-darker" style={{background: '#0d0d0d'}}>
            <h5 className="text-secondary small fw-bold mb-4 tracking-widest">SYSTEM ACTIVITY</h5>
            <div ref={logsRef} className="flex-grow-1 font-monospace small" style={{overflowY: 'auto', color: '#00ff41'}}>
              {logs.length === 0 && <span className="text-secondary opacity-50">...waiting for input...</span>}
              {logs.map((log, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-2"
                    >
                        <span className="opacity-50 me-2">[{new Date().toLocaleTimeString([], {hour12: false})}]</span>
                        {log.text}
                    </motion.div>
                ))}
                <div style={{height: 6}}/>
            </div>
            
            <div className="mt-3 pt-3 border-top border-secondary">
                 <label className="btn btn-outline-secondary w-100 btn-sm text-start">
                    <FaPaperclip className="me-2"/> {file ? file.name : "Upload PDF Context"}
                    <input type="file" hidden onChange={handleUpload} />
                 </label>
            </div>
        </div>

        {/* Chat Area */}
        <div className="col-lg-8 d-flex flex-column bg-black position-relative">
            {/* Header */}
            <div className="p-3 d-flex align-items-center justify-content-center border-bottom border-secondary">
                 <span className="badge bg-secondary bg-opacity-25 text-light px-3 py-1 rounded-pill">Adaptive RAG v1.0</span>
            </div>

            {/* Messages */}
            <div ref={messagesRef} className="flex-grow-1 p-4" style={{overflowY: 'auto'}}>
                <AnimatePresence>
                {messages.map((msg, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`d-flex mb-4 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                        <div className={`px-4 py-3 rounded-4 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-secondary bg-opacity-25 text-light'}`} style={{maxWidth: '80%', fontSize: '1.05rem'}}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
                {loading && <div className="text-center text-secondary small animate-pulse">Thinking...</div>}
            </div>

            {/* Input */}
            <div className="p-4 bg-black">
                <div className="position-relative">
                    <input 
                        className="form-control input-glass py-3 ps-4 pe-5" 
                        placeholder="Ask about the document or the web..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button 
                        className="btn position-absolute top-50 end-0 translate-middle-y me-2 text-primary" 
                        onClick={sendMessage}
                        style={{background: 'none', border: 'none'}}
                    >
                        <FaArrowUp size={20}/>
                    </button>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatInterface;