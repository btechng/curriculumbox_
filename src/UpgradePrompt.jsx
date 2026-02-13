import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Zap, Star, ArrowRight } from "lucide-react";

const UpgradePrompt = ({ feature, onClose }) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate("/pricing");
    if (onClose) onClose();
  };

  return (
    <div className="upgrade-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="modal-icon">
          <Lock size={48} />
        </div>

        <h2>Premium Feature</h2>
        <p className="subtitle">
          {feature || "This feature"} requires a premium subscription
        </p>

        <div className="features-preview">
          <div className="feature-item">
            <Zap size={20} />
            <span>Unlimited Lesson Plans</span>
          </div>
          <div className="feature-item">
            <Star size={20} />
            <span>Unlimited Questions</span>
          </div>
          <div className="feature-item">
            <Zap size={20} />
            <span>Export to PDF/Word</span>
          </div>
          <div className="feature-item">
            <Star size={20} />
            <span>AI Teaching Assistant</span>
          </div>
        </div>

        <div className="pricing-info">
          <div className="price-option">
            <div className="price-label">Monthly</div>
            <div className="price-amount">
              ₦1,000<span>/month</span>
            </div>
          </div>
          <div className="price-option featured">
            <div className="badge">Best Value</div>
            <div className="price-label">Yearly</div>
            <div className="price-amount">
              ₦5,000<span>/year</span>
            </div>
            <div className="savings">Save ₦7,000!</div>
          </div>
        </div>

        <button className="upgrade-btn" onClick={handleUpgrade}>
          Upgrade to Premium
          <ArrowRight size={20} />
        </button>

        <p className="trial-text">
          ✨ Start with a <strong>7-day free trial</strong>
        </p>
      </div>

      <style>{`
        .upgrade-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .upgrade-modal {
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          position: relative;
          animation: slideUp 0.3s ease;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: #f3f4f6;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          color: #6b7280;
          transition: all 0.3s;
        }

        .close-btn:hover {
          background: #e5e7eb;
          color: #2d3748;
        }

        .modal-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: white;
        }

        h2 {
          text-align: center;
          font-size: 28px;
          margin: 0 0 10px 0;
          color: #2d3748;
        }

        .subtitle {
          text-align: center;
          color: #6b7280;
          margin: 0 0 30px 0;
          font-size: 16px;
        }

        .features-preview {
          background: #f9fafb;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 25px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          color: #2d3748;
        }

        .feature-item svg {
          color: #667eea;
          flex-shrink: 0;
        }

        .pricing-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 25px;
        }

        .price-option {
          background: #f9fafb;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          border: 2px solid #e5e7eb;
          position: relative;
        }

        .price-option.featured {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #667eea;
        }

        .badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #10b981;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .price-label {
          font-size: 14px;
          margin-bottom: 8px;
          opacity: 0.8;
        }

        .price-amount {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .price-amount span {
          font-size: 14px;
          opacity: 0.8;
        }

        .savings {
          font-size: 12px;
          font-weight: 600;
          opacity: 0.9;
        }

        .upgrade-btn {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s;
        }

        .upgrade-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .trial-text {
          text-align: center;
          margin: 15px 0 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .trial-text strong {
          color: #667eea;
        }

        @media (max-width: 768px) {
          .upgrade-modal {
            padding: 30px 20px;
          }

          .pricing-info {
            grid-template-columns: 1fr;
          }

          h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default UpgradePrompt;
