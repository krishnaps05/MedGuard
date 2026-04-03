import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Shield, History, Info, Trash2, PlusCircle, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Message from './Message';

const API_URL = 'http://localhost:8000';

const ChatInterface = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      text: "Welcome to MedGuard AI Diagnostics. Our secondary Hallucination Detection Engine is initialized and monitoring this clinical sandbox.", 
      isUser: false 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showProtocols, setShowProtocols] = useState(false);
  const [currentRisk, setCurrentRisk] = useState(null);
  const [history, setHistory] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = async () => {
    try {
      const resp = await axios.get(`${API_URL}/history`);
      setHistory(resp.data);
    } catch (err) {
      console.error("History fetch error:", err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/ask`, { question: input });
      const aiResponse = { 
        text: response.data.answer, 
        isUser: false,
        safety: response.data.safety_level,
        explanation: response.data.explanation,
        score: response.data.confidence_score
      };
      
      setMessages(prev => [...prev, aiResponse]);
      fetchHistory(); // Refresh sidebar
      
      if (response.data.safety_level === 'High Risk') {
        setCurrentRisk(response.data);
        setShowRiskModal(true);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages(prev => [...prev, { text: "Protocol Error: Unable to sync with MedGuard Core. Ensure local server is active.", isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await axios.post(`${API_URL}/clear`);
      setMessages([{ text: "Neural pathways purged. System ready for new input.", isUser: false }]);
      setHistory([]);
    } catch (error) {
       console.error("Error clearing chat:", error);
    }
  };

  const examples = [
    "Is ibuprofen safe during pregnancy?",
    "Can I give paracetamol to my child for fever?",
    "Check risk of aspirin for infants.",
  ];

  return (
    <div className="container neon-bg">
      {/* Sidebar */}
      <aside className="sidebar glass-morphism">
        <div className="sidebar-header">
          <Shield size={32} className="neon-icon" />
          <h1 className="logo">MedGuard</h1>
        </div>
        
        <nav className="nav-group">
          <button className="new-chat-btn" onClick={() => setMessages([{ text: "Diagnostic session reset.", isUser: false }])}>
            <PlusCircle size={18} /> NEW SESSION
          </button>
          
          <div className="history-section">
            <p className="section-title"><History size={16} /> RECENT LOGS</p>
            {history.length > 0 ? (
              history.slice(0, 5).reverse().map((item, idx) => (
                <div key={idx} className="history-item">
                  <div className={`status-dot ${item.safety_level === 'Safe' ? 'green' : (item.safety_level === 'Uncertain' ? 'yellow' : 'red')}`}></div>
                  <span className="truncate">{item.question}</span>
                </div>
              ))
            ) : (
              <p className="no-history">No clinical logs yet.</p>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="footer-btn" onClick={clearChat}><Trash2 size={16} /> FLUSH CACHE</button>
          <button className="footer-btn" onClick={() => setShowProtocols(true)}><Info size={16} /> PROTOCOLS</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-chat">
        <header className="header glass-morphism">
          <div className="header-info">
            <h2>MEDGUARD DIAGNOSTIC V2.4</h2>
            <div className="badges">
              <span className="live-status">● HDL ENGINE ACTIVE</span>
              <span className="dataset-count">8.4k Verified Records</span>
            </div>
          </div>
          <div className="controls">
             <div className="connection-status">
               <span className="dot green"></span> SECURE LINK
             </div>
          </div>
        </header>

        <section className="chat-area">
          {messages.map((m, i) => (
            <Message 
              key={i} 
              text={m.text} 
              isUser={m.isUser} 
              safety={m.safety} 
              explanation={m.explanation}
              score={m.score}
            />
          ))}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <span>Auditing Neural Output...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </section>

        <section className="input-area">
          <div className="examples-container">
            {examples.map((ex, i) => (
              <motion.button 
                whileHover={{ scale: 1.05, background: 'rgba(0, 255, 242, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                key={i} 
                className="example-pill" 
                onClick={() => setInput(ex)}
              >
                {ex}
              </motion.button>
            ))}
          </div>
          <form className="input-bar glass-morphism" onSubmit={handleSend}>
            <input 
              autoFocus
              type="text" 
              placeholder="Inject query into diagnosis engine..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="send-icon" disabled={loading}>
              <Send size={24} />
            </button>
          </form>
          <p className="legal-disclaimer">
             NOT FOR CLINICAL USE. AI-DETECTED RISKS ARE FOR ADVISORY REVIEW ONLY.
          </p>
        </section>
      </main>

      {/* Protocols Information Modal */}
      <AnimatePresence>
        {showProtocols && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="modal-content"
            >
              <div className="modal-header">
                <Shield size={40} className="neon-icon" />
                <div>
                  <h3>MEDGUARD PROTOCOLS</h3>
                  <p className="modal-subtitle">HDL Engine Guidelines</p>
                </div>
                <button onClick={() => setShowProtocols(false)} className="close-all-btn"><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="protocol-card">
                  <h4>Layer 1: Rule-Based Audit</h4>
                  <p>Scans for high-risk clinical keywords (dosage, surgery, side effects) and verifies the presence of mandatory medical disclaimers.</p>
                </div>
                <div className="protocol-card" style={{ marginTop: '1rem' }}>
                  <h4>Layer 2: Knowledge Validation</h4>
                  <p>Cross-references AI responses against 8.4k+ verified medical records from curated datasets (e.g., dataset.json).</p>
                </div>
                <div className="protocol-card" style={{ marginTop: '1rem' }}>
                  <h4>Safety Scoring</h4>
                  <p>Confidence scores below 40% trigger automatic "High Risk" isolation and visual user alerts.</p>
                </div>
              </div>
              <button className="confirm-btn" onClick={() => setShowProtocols(false)} style={{ background: '#00fff2', color: '#000' }}>CLOSE PROTOCOLS</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Risk Alert Modal */}
      <AnimatePresence>
        {showRiskModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="modal-content risk-warning"
            >
              <div className="modal-header">
                <AlertTriangle size={40} color="#E76F51" className="shake-icon" />
                <div>
                  <h3>HALLUCINATION DETECTED</h3>
                  <p className="modal-subtitle">High Risk Protocol Triggered</p>
                </div>
                <button onClick={() => setShowRiskModal(false)} className="close-all-btn"><X size={20} /></button>
              </div>
              <div className="modal-body">
                <p>The MedGuard HDL Engine has flagged the previous AI response as biologically inconsistent or dangerous.</p>
                <div className="risk-details">
                   <p><strong>DETECTION LOG:</strong> {currentRisk?.explanation}</p>
                   <p><strong>CONFIDENCE SCORE:</strong> {currentRisk?.confidence_score}%</p>
                </div>
              </div>
              <button className="confirm-btn" onClick={() => setShowRiskModal(false)}>ACKNOWLEDGE RISK</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .neon-bg {
          background: #0a0e14;
          background-image: 
            radial-gradient(at 0% 0%, hsla(180, 100%, 30%, 0.1) 0, transparent 50%), 
            radial-gradient(at 50% 0%, hsla(110, 100%, 30%, 0.05) 0, transparent 50%);
          display: flex;
          height: 100vh;
        }
        
        .sidebar { width: 300px; background: rgba(0, 0, 0, 0.4); border-right: 1px solid #ffffff11; display: flex; flex-direction: column; padding: 2rem 0; }
        .sidebar-header { padding: 0 2rem; display: flex; align-items: center; gap: 1rem; margin-bottom: 3rem; }
        .logo { font-size: 1.8rem; font-weight: 900; color: #fff; letter-spacing: -1px; }
        .neon-icon { color: #00fff2; filter: drop-shadow(0 0 10px #00fff288); }
        
        .nav-group { flex: 1; padding: 0 1rem; }
        .new-chat-btn { width: 100%; padding: 1rem; background: #00fff20d; border: 1px solid #00fff233; color: #00fff2; border-radius: 12px; display: flex; align-items: center; gap: 0.8rem; cursor: pointer; font-weight: 700; margin-bottom: 2.5rem; transition: 0.3s; }
        .new-chat-btn:hover { background: #00fff222; border-color: #00fff2; box-shadow: 0 0 20px #00fff222; }
        
        .history-section { border-top: 1px solid #ffffff11; padding-top: 2rem; }
        .section-title { font-size: 0.7rem; color: #555; font-weight: 900; letter-spacing: 2px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .history-item { color: #888; font-size: 0.8rem; padding: 0.8rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 1rem; transition: 0.2s; }
        .history-item:hover { background: #ffffff05; color: #fff; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-dot.green { background: #00ffaa; box-shadow: 0 0 8px #00ffaa; }
        .status-dot.yellow { background: #ffcc00; box-shadow: 0 0 8px #ffcc00; }
        .status-dot.red { background: #ff4444; box-shadow: 0 0 8px #ff4444; }
        .no-history { color: #444; font-size: 0.75rem; padding: 1rem; font-style: italic; }
        .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }

        .sidebar-footer { padding: 0 1rem; border-top: 1px solid #ffffff11; padding-top: 1rem; }
        .footer-btn { background: none; border: none; color: #666; font-size: 0.8rem; display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem; cursor: pointer; width: 100%; text-align: left; font-weight: 600; }
        .footer-btn:hover { color: #fff; }

        .main-chat { flex: 1; display: flex; flex-direction: column; background: #0a0e14; }
        .header { padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ffffff05; }
        .header-info h2 { font-size: 0.9rem; font-weight: 800; letter-spacing: 3px; color: #fff; margin-bottom: 0.3rem; opacity: 0.8; }
        .badges { display: flex; gap: 1rem; }
        .live-status { font-size: 0.6rem; color: #00ffaa; font-weight: 800; background: #00ffaa11; padding: 0.2rem 0.6rem; border-radius: 4px; border: 1px solid #00ffaa44; }
        .dataset-count { font-size: 0.6rem; color: #666; font-weight: 600; }
        .connection-status { font-size: 0.7rem; color: #00ffaa; display: flex; align-items: center; gap: 0.5rem; font-weight: 800; }

        .chat-area { flex: 1; overflow-y: auto; padding: 3rem; display: flex; flex-direction: column; gap: 2rem; scrollbar-width: none; }
        .chat-area::-webkit-scrollbar { display: none; }

        .loading-state { display: flex; align-items: center; gap: 1rem; color: #00fff2; font-size: 0.9rem; font-weight: 600; }
        .spinner { width: 20px; height: 20px; border: 2px solid #00fff222; border-top-color: #00fff2; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .input-area { padding: 2rem 3rem; background: linear-gradient(to top, #0a0e14 70%, transparent); }
        .examples-container { max-width: 900px; margin: 0 auto 1.5rem; display: flex; flex-wrap: wrap; gap: 0.8rem; justify-content: center; }
        .example-pill { padding: 0.6rem 1.2rem; background: #ffffff05; border: 1px solid #ffffff11; border-radius: 50px; color: #aaa; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: 0.2s; }
        
        .input-bar { max-width: 900px; margin: 0 auto; background: rgba(255, 255, 255, 0.03); border: 1px solid #ffffff11; border-radius: 24px; padding: 1rem 2rem; display: flex; align-items: center; gap: 1.5rem; box-shadow: 0 10px 40px -10px #000; }
        .input-bar input { background: transparent; color: #fff; flex: 1; border: none; outline: none; font-size: 1.1rem; }
        .input-bar input::placeholder { color: #444; }
        .send-icon { background: none; border: none; color: #00fff2; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .send-icon:hover { transform: scale(1.1) rotate(-10deg); color: #fff; }

        .legal-disclaimer { text-align: center; font-size: 0.65rem; color: #444; font-weight: 800; letter-spacing: 1px; margin-top: 1.5rem; text-transform: uppercase; }

        .modal-overlay { position: fixed; inset: 0; background: #000000dd; backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
        .modal-content { background: #11141a; border: 1px solid #ffffff08; padding: 3rem; border-radius: 32px; width: 100%; max-width: 550px; box-shadow: 0 30px 100px #000; position: relative; }
        .risk-warning { border-top: 6px solid #E76F51; }
        .modal-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
        .modal-header h3 { font-size: 1.4rem; color: #fff; font-weight: 900; letter-spacing: 1px; }
        .modal-subtitle { font-size: 0.8rem; color: #E76F51; font-weight: 800; letter-spacing: 1px; }
        .close-all-btn { position: absolute; top: 2rem; right: 2rem; background: #ffffff08; border: none; color: #fff; border-radius: 50%; padding: 0.4rem; cursor: pointer; transition: 0.2s; }
        .close-all-btn:hover { background: #ffffff11; }
        
        .modal-body { color: #aaa; font-size: 1rem; line-height: 1.6; }
        .risk-details { background: #00000066; padding: 1.5rem; border-radius: 16px; margin-top: 1.5rem; border-left: 3px solid #E76F51; }
        .risk-details p { margin-bottom: 0.5rem; }
        .risk-details strong { color: #fff; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; margin-right: 0.5rem; }

        .confirm-btn { width: 100%; margin-top: 2rem; padding: 1.2rem; background: #E76F51; color: #fff; border: none; border-radius: 16px; font-weight: 900; letter-spacing: 2px; cursor: pointer; transition: 0.3s; }
        .confirm-btn:hover { background: #f08166; transform: translateY(-3px); box-shadow: 0 10px 20px #E76F5133; }
        
        .protocol-card { background: rgba(255, 255, 255, 0.03); border: 1px solid #ffffff08; padding: 1.2rem; border-radius: 16px; }
        .protocol-card h4 { color: #00fff2; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
        .protocol-card p { font-size: 0.9rem; color: #999; }
        
        @keyframes alert-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake-icon { animation: alert-shake 0.4s infinite; }
      `}</style>
    </div>
  );
};

export default ChatInterface;
