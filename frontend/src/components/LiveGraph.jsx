import React, { useState, useEffect } from 'react';
import Xarrow, { useXarrow } from 'react-xarrows';
import { motion, AnimatePresence } from 'framer-motion';

const nodeStyle = {
  width: '120px',
  height: '60px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '30px',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  position: 'relative',
  zIndex: 10,
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.5s ease'
};

const activeGlow = {
  boxShadow: '0 0 20px #2997ff, 0 0 40px rgba(41,151,255,0.4)',
  borderColor: '#2997ff',
  scale: 1.1,
  color: '#fff'
};

const Node = ({ id, label, color, isActive }) => (
  <motion.div 
    id={id} 
    style={{ 
      ...nodeStyle, 
      background: isActive ? color : '#1c1c1e',
      color: isActive ? '#fff' : '#86868b'
    }}
    animate={isActive ? activeGlow : { scale: 1 }}
  >
    {label}
  </motion.div>
);

const LiveGraph = () => {
  const updateXarrow = useXarrow();
  const [activeStep, setActiveStep] = useState(0);
  const [scenario, setScenario] = useState("pdf"); // "pdf" or "web"

  // Simulation Loop
  useEffect(() => {
    const sequence = scenario === "pdf" 
      ? ["start", "retrieve", "grade", "generate", "end"]
      : ["start", "retrieve", "grade", "websearch", "generate", "end"];
    
    let current = 0;
    const interval = setInterval(() => {
        setActiveStep(sequence[current]);
        current++;
        if (current >= sequence.length) {
            current = 0;
            // Switch scenario for variety
            setScenario(prev => prev === "pdf" ? "web" : "pdf");
        }
    }, 1500); // Change step every 1.5s

    return () => clearInterval(interval);
  }, [scenario]);

  return (
    <div className="position-relative w-100 h-100 d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '500px' }}>
      
      {/* Simulation Label */}
      <div className="position-absolute top-0 start-0 m-3 badge bg-dark border border-secondary text-secondary font-monospace">
        SIMULATION: {scenario === "pdf" ? "DOC RELEVANT" : "WEB FALLBACK"}
      </div>

      {/* --- LEVEL 1: START --- */}
      <Node id="start" label="START" color="#34c759" isActive={activeStep === "start"} />
      
      <div style={{ height: '60px' }}></div>

      {/* --- LEVEL 2: RETRIEVE --- */}
      <Node id="retrieve" label="retrieve_node" color="#0a84ff" isActive={activeStep === "retrieve"} />

      <div style={{ height: '60px' }}></div>

      {/* --- LEVEL 3: GRADE --- */}
      <Node id="grade" label="grade_docs" color="#0a84ff" isActive={activeStep === "grade"} />

      <div style={{ height: '60px' }}></div>

      {/* --- LEVEL 4: WEB SEARCH (Conditional) --- */}
      <div className="d-flex gap-5">
         {/* Offset Web Search to the left to match image structure roughly */}
         <div style={{transform: 'translateX(-80px)'}}>
            <Node id="websearch" label="web_search" color="#0a84ff" isActive={activeStep === "websearch"} />
         </div>
      </div>

      {/* --- LEVEL 5: GENERATE --- */}
      {/* Overlapping layout logic to look like the graph */}
      <div style={{ marginTop: '-40px', transform: 'translateX(80px)' }}>
        <Node id="generate" label="generate_node" color="#0a84ff" isActive={activeStep === "generate"} />
      </div>

      <div style={{ height: '60px' }}></div>

      {/* --- LEVEL 6: END --- */}
      <Node id="end" label="END" color="#ff3b30" isActive={activeStep === "end"} />

      {/* --- ARROWS --- */}
      {/* Define connections based on the flow image */}
      <Xarrow start="start" end="retrieve" color="#333" strokeWidth={2} path="straight" showHead={true} animateDrawing={activeStep === "start"} />
      
      <Xarrow start="retrieve" end="grade" color="#333" strokeWidth={2} path="straight" showHead={true} animateDrawing={activeStep === "retrieve"} />
      
      {/* Grade branches */}
      <Xarrow start="grade" end="websearch" color="#333" strokeWidth={2} path="smooth" labels={{middle: <span style={{fontSize:10, color:'#555'}}>Irrelevant</span>}} dashness={true} />
      <Xarrow start="grade" end="generate" color="#333" strokeWidth={2} path="smooth" labels={{middle: <span style={{fontSize:10, color:'#555'}}>Relevant</span>}} />

      <Xarrow start="websearch" end="generate" color="#333" strokeWidth={2} path="smooth" />
      
      <Xarrow start="generate" end="end" color="#333" strokeWidth={2} path="straight" showHead={true} animateDrawing={activeStep === "generate"} />

    </div>
  );
};

export default LiveGraph;