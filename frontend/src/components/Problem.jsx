import React from 'react';
import { motion } from 'framer-motion';
import { FaTimesCircle, FaCheckCircle, FaExclamationTriangle, FaLightbulb } from 'react-icons/fa';

const Problem = () => {
  return (
    <section className="py-5 bg-black position-relative" id="problem">
      <div className="container py-5">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-5"
        >
          <span className="badge border border-secondary text-secondary rounded-pill px-3 py-2 mb-3">The Challenge</span>
          <h2 className="display-5 text-white fw-bold mb-3">Why Standard Chatbots Fail.</h2>
          <p className="text-secondary fs-5 mx-auto" style={{maxWidth: '600px'}}>
            Traditional RAG systems are rigid. They either strictly read a file or strictly search the web. They lack the judgment to do both.
          </p>
        </motion.div>

        <div className="row g-4">
            {/* The Old Way */}
            <div className="col-md-6">
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="apple-card h-100 position-relative overflow-hidden"
                    style={{ background: 'rgba(255, 59, 48, 0.05)', borderColor: 'rgba(255, 59, 48, 0.2)' }}
                >
                    <div className="d-flex align-items-center mb-4">
                        <div className="p-3 rounded-circle me-3" style={{background: 'rgba(255, 59, 48, 0.1)'}}>
                            <FaExclamationTriangle className="text-danger fs-4" />
                        </div>
                        <h3 className="h4 text-white fw-bold mb-0">The Static Limit</h3>
                    </div>
                    
                    <p className="text-secondary mb-4">
                        Most chatbots are "blind". If you ask about something <em>not</em> in the PDF, they hallucinate or give a generic "I don't know" error.
                    </p>
                    
                    <div className="p-3 rounded-3 font-monospace small" style={{background: '#000', border: '1px solid rgba(255, 59, 48, 0.2)'}}>
                        <div className="text-secondary mb-2">User: "Who won the game yesterday?"</div>
                        <div className="text-danger d-flex align-items-start gap-2">
                            <FaTimesCircle className="mt-1 flex-shrink-0" /> 
                            <span>"I cannot answer that. It is not mentioned in the uploaded HR Handbook."</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* The Solution */}
            <div className="col-md-6">
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="apple-card h-100 position-relative overflow-hidden"
                    style={{ background: 'rgba(48, 209, 88, 0.05)', borderColor: 'rgba(48, 209, 88, 0.2)' }}
                >
                    <div className="d-flex align-items-center mb-4">
                        <div className="p-3 rounded-circle me-3" style={{background: 'rgba(48, 209, 88, 0.1)'}}>
                            <FaLightbulb className="text-success fs-4" />
                        </div>
                        <h3 className="h4 text-white fw-bold mb-0">The Adaptive Solution</h3>
                    </div>

                    <p className="text-secondary mb-4">
                        We built a <strong>Smart Router</strong>. It classifies your intent first. If the PDF lacks answers, it automatically pivots to Google Search.
                    </p>
                    
                    <div className="p-3 rounded-3 font-monospace small" style={{background: '#000', border: '1px solid rgba(48, 209, 88, 0.2)'}}>
                        <div className="text-secondary mb-2">User: "Who won the game yesterday?"</div>
                        <div className="text-success d-flex align-items-start gap-2">
                            <FaCheckCircle className="mt-1 flex-shrink-0" /> 
                            <span>[Routing to Web] -&gt; "The Chiefs won 24-21."</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;