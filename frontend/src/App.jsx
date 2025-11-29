import React from 'react';
import { motion } from 'framer-motion';
import { FaBrain, FaGlobeAmericas, FaLayerGroup, FaGithub, FaLinkedin, FaHeart, FaCode, FaArrowRight } from 'react-icons/fa';
import ChatInterface from './components/ChatInterface';
import LiveGraph from './components/LiveGraph';
import Problem from './components/Problem';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const App = () => {
  return (
    <div>
      {/* 1. Navbar */}
      <nav className="navbar fixed-top glass-nav py-3">
        <div className="container">
          <a className="navbar-brand fw-bold text-white fs-4" href="#">
            Adaptive<span className="text-secondary">RAG</span>
          </a>
          <a href="#demo" className="btn btn-sm btn-light rounded-pill px-4 fw-bold">Try Demo</a>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="d-flex flex-column align-items-center justify-content-center text-center min-vh-100 position-relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="position-absolute" style={{width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(41,151,255,0.15) 0%, rgba(0,0,0,0) 60%)', filter: 'blur(100px)', zIndex: -1, top: '-10%'}}></div>
        
        <div className="container mt-5 z-1">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <span className="badge border border-secondary text-secondary rounded-pill px-3 py-2 mb-4">Updated RAG System</span>
            <h1 className="display-title mb-4">
              Intelligence, <br />
              <span className="text-gradient">Routed Perfectly.</span>
            </h1>
            <p className="lead text-secondary mb-5 mx-auto" style={{maxWidth: '600px', fontSize: '1.25rem'}}>
              A RAG system that understands context. It automatically switches between your documents and the web.
            </p>
            <div className="d-flex gap-3 justify-content-center">
               <a href="#demo" className="btn btn-apple">Launch System</a>
               <a href="#architecture" className="btn btn-apple-outline">How it works</a>
            </div>
          </motion.div>
        </div>
        
        {/* Hero Visual Line */}
        <motion.div 
            className="mt-5 position-relative z-0"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 1 }}
        >
            <div style={{width: '1px', height: '120px', background: 'linear-gradient(to bottom, #2997ff, transparent)', margin: '0 auto'}}></div>
        </motion.div>
      </section>

      <Problem />

      {/* 3. The Architecture Section (Refined Layout) */}
      <section className="py-5 bg-black" id="architecture">
        <div className="container py-5">
            <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                className="mb-5"
            >
                <div className="row align-items-end">
                    <div className="col-lg-6">
                        <h2 className="text-white display-5 mb-2">The Decision Engine.</h2>
                        <p className="text-secondary fs-5 mb-0">How we solved the "Hallucination" problem.</p>
                    </div>
                    <div className="col-lg-6 text-lg-end d-none d-lg-block">
                         <span className="text-secondary small">Powered by LangGraph & Tavily</span>
                    </div>
                </div>
            </motion.div>

            <div className="row g-4">
                {/* LEFT COLUMN: The Logic Cards */}
                <div className="col-lg-5 d-flex flex-column gap-4">
                    
                    {/* Card 1: Router (Primary Logic) */}
                    <div className="apple-card position-relative overflow-hidden">
                        <div className="position-absolute top-0 end-0 p-3 opacity-25">
                            <FaBrain size={60} />
                        </div>
                        <h3 className="text-white h5 mb-2">The Intent Router</h3>
                        <p className="text-secondary small mb-3">
                            The system analyzes your prompt before acting. It determines if you need specific document retrieval or general web knowledge.
                        </p>
                        <div className="d-flex gap-2">
                            <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25">Vector Store</span>
                            <span className="badge bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-25">Web Search</span>
                        </div>
                    </div>

                    {/* Split Row for Secondary Logic */}
                    <div className="row g-4 h-100">
                        <div className="col-md-6">
                            <div className="apple-card h-100 d-flex flex-column justify-content-between">
                                <FaGlobeAmericas className="text-primary fs-3 mb-3" />
                                <div>
                                    <h4 className="text-white h6">Live Web Fallback</h4>
                                    <p className="text-secondary small mb-0">If the PDF doesn't have the answer, we search Google via Tavily.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="apple-card h-100 d-flex flex-column justify-content-between">
                                <FaLayerGroup className="text-purple fs-3 mb-3" style={{color: '#bf5af2'}}/>
                                <div>
                                    <h4 className="text-white h6">Relevance Grader</h4>
                                    <p className="text-secondary small mb-0">We grade retrieved docs. If they are bad, we discard them.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: The Visualizer (Tall) */}
                <div className="col-lg-7">
                    <div className="apple-card h-100 p-0 overflow-hidden d-flex flex-column border-0" style={{background: 'rgba(28,28,30,0.5)', border: '1px solid rgba(255,255,255,0.08)'}}>
                        <div className="p-4 border-bottom border-secondary d-flex justify-content-between align-items-center">
                             <h3 className="text-white h6 mb-0 d-flex align-items-center gap-2">
                                <span className="d-inline-block rounded-circle bg-success pulse-animation" style={{width: 8, height: 8}}></span>
                                Live Logic Graph
                             </h3>
                             <div className="text-secondary small font-monospace">STATUS: ACTIVE</div>
                        </div>
                        
                        {/* The Animation Container */}
                        <div className="flex-grow-1 position-relative bg-darker" style={{ minHeight: '500px' }}>
                            <LiveGraph />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 4. Live Demo Section */}
      <section className="py-5" style={{background: 'linear-gradient(to bottom, #000, #050507)'}}>
         <div className="container pt-5">
            <div className="text-center mb-5">
                <span className="badge border border-secondary text-secondary rounded-pill px-3 py-2 mb-3">Interactive Demo</span>
                <h2 className="display-5 text-white fw-bold">Try it yourself.</h2>
            </div>
            <ChatInterface />
         </div>
      </section>

      {/* Footer */}
      {/* Enhanced Footer */}
      <footer className="py-5" style={{ background: '#050507', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container">
          <div className="row g-4 mb-5">
            
            {/* Column 1: Brand & Mission */}
            <div className="col-lg-4 col-md-12 mb-4 mb-lg-0">
              <h5 className="fw-bold text-white mb-3">Adaptive<span className="text-secondary">RAG</span></h5>
              <p className="text-secondary small pe-lg-5" style={{maxWidth: '300px'}}>
                A next-generation retrieval system capable of intelligent routing between static documents and the live web. 
                Bridging the gap between storage and search.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="col-6 col-lg-2 col-md-4">
              <h6 className="text-white fw-bold mb-3 small text-uppercase tracking-wide">Project</h6>
              <ul className="list-unstyled text-secondary small d-flex flex-column gap-2">
                <li><a href="#architecture" className="text-secondary hover-white text-decoration-none">Architecture</a></li>
                <li><a href="#demo" className="text-secondary hover-white text-decoration-none">Live Demo</a></li>
              </ul>
            </div>

            {/* Column 3: Tech Stack */}
            <div className="col-6 col-lg-2 col-md-4">
              <h6 className="text-white fw-bold mb-3 small text-uppercase tracking-wide">Technology</h6>
              <ul className="list-unstyled text-secondary small d-flex flex-column gap-2">
                <li><span className="hover-white cursor-pointer">LangChain</span></li>
                <li><span className="hover-white cursor-pointer">LangGraph</span></li>
                <li><span className="hover-white cursor-pointer">FastAPI</span></li>
                <li><span className="hover-white cursor-pointer">GoogleGenerativeAI</span></li>
                <li><span className="hover-white cursor-pointer">Tavily Search</span></li>
              </ul>
            </div>

            {/* Column 4: Socials */}
            <div className="col-lg-4 col-md-4">
              <h6 className="text-white fw-bold mb-3 small text-uppercase tracking-wide">Connect</h6>
              <div className="d-flex gap-3">
                <a href="https://github.com/Meetvaghela-code" className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{width: '38px', height: '38px'}}>
                  <FaGithub className="text-white" />
                </a>
                <a href="https://www.linkedin.com/in/vaghelameet/" className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{width: '38px', height: '38px'}}>
                  <FaLinkedin className="text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright */}
          <div className="border-top pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-secondary small mb-2 mb-md-0">
              &copy; {new Date().getFullYear()} Adaptive RAG Project. All rights reserved.
            </p>
            <p className="text-secondary small mb-0 d-flex align-items-center">
              Designed with <FaHeart className="text-danger mx-2" size={12} /> and <FaCode className="text-primary mx-2" size={14} />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;