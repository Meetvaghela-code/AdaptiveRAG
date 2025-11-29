import React from 'react';
import { motion } from 'framer-motion';
import { FaBrain, FaFilePdf, FaGlobe, FaSearch } from 'react-icons/fa';

const Node = ({ icon, label, delay }) => (
    <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ delay, type: "spring", stiffness: 100 }}
        viewport={{ once: true }}
        className="d-flex flex-column align-items-center"
    >
        <div className="glass-panel rounded-circle p-4 mb-3 d-flex align-items-center justify-content-center glow-on-hover" 
             style={{ width: '100px', height: '100px', fontSize: '2rem' }}>
            {icon}
        </div>
        <h5 className="fw-bold">{label}</h5>
    </motion.div>
);

const Architecture = () => {
  return (
    <section className="py-5 bg-black bg-opacity-25">
      <div className="container py-5 text-center">
        <h2 className="display-4 fw-bold mb-5">The Architecture</h2>
        
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 position-relative">
            {/* Connector Lines (simplified as border for demo) */}
            <Node icon={<FaBrain className="text-warning"/>} label="1. Router" delay={0.1} />
            <motion.div initial={{ width: 0 }} whileInView={{ width: 100 }} className="d-none d-md-block border-top border-2 border-secondary" style={{height: 2}}></motion.div>
            
            <div className="d-flex flex-column gap-5">
                <Node icon={<FaFilePdf className="text-primary"/>} label="2a. Vector Store" delay={0.3} />
                <Node icon={<FaGlobe className="text-success"/>} label="2b. Web Search" delay={0.4} />
            </div>

            <motion.div initial={{ width: 0 }} whileInView={{ width: 100 }} className="d-none d-md-block border-top border-2 border-secondary" style={{height: 2}}></motion.div>
            <Node icon={<FaSearch className="text-info"/>} label="3. Grader" delay={0.6} />
        </div>
        
        <p className="mt-5 text-muted mx-auto" style={{maxWidth: '600px'}}>
            Built using <strong>LangGraph</strong> state machines. The graph maintains context (memory) and executes conditional logic at every step.
        </p>
      </div>
    </section>
  );
};

export default Architecture;