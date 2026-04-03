import React from 'react';
import SafetyBadge from './SafetyBadge';
import { Bot, User, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Message = ({ text, isUser, safety, explanation, score }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`message-wrapper ${isUser ? 'user-wrapper' : 'ai-wrapper'}`}
    >
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble glass-morphism'}`}>
        <div className="message-header">
          {isUser ? <User size={14} /> : <Activity size={14} className="pulse-icon" />}
          <span>{isUser ? 'AUTHORIZED USER' : 'MEDGUARD CORE'}</span>
        </div>
        
        <p className="message-text">{text}</p>
        
        {!isUser && safety && (
          <div className="safety-container">
            <SafetyBadge level={safety} score={score} />
            {explanation && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="explanation-box"
              >
                <div className="explanation-label">AUDIT LOG:</div>
                <p>{explanation}</p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .message-wrapper { display: flex; width: 100%; margin-bottom: 1rem; }
        .user-wrapper { justify-content: flex-end; }
        .ai-wrapper { justify-content: flex-start; }

        .message-bubble { max-width: 80%; padding: 1.5rem; border-radius: 20px; position: relative; box-shadow: 0 10px 30px #00000044; }
        
        .user-bubble { 
          background: linear-gradient(135deg, #00fff2, #0088ff); 
          color: #000; 
          border-bottom-right-radius: 4px;
          font-weight: 500;
        }
        
        .ai-bubble { 
          background: rgba(255, 255, 255, 0.05); 
          border: 1px solid #ffffff11;
          color: #eee; 
          border-bottom-left-radius: 4px;
        }

        .message-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.8rem; opacity: 0.6; font-size: 0.65rem; font-weight: 900; letter-spacing: 1.5px; }
        .user-bubble .message-header { color: #000; opacity: 0.8; }
        
        .message-text { font-size: 1rem; line-height: 1.6; letter-spacing: 0.3px; }
        
        .safety-container { margin-top: 1.5rem; padding-top: 1.2rem; border-top: 1px solid #ffffff11; }
        
        .explanation-box { background: #00000044; border-radius: 12px; padding: 1rem; margin-top: 1rem; border-left: 2px solid #00fff2; }
        .explanation-label { font-size: 0.6rem; font-weight: 900; color: #00fff2; margin-bottom: 0.4rem; letter-spacing: 1px; }
        .explanation-box p { font-size: 0.85rem; color: #ccc; line-height: 1.5; }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .pulse-icon { color: #00fff2; animation: pulse 2s infinite; }
      `}</style>
    </motion.div>
  );
};

export default Message;
