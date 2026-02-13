import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Copy, Users, Gift, Check, Share2, TrendingUp } from "lucide-react";

const ReferralDashboard = () => {
  const { user } = useAuth();
  const [referralData, setReferralData] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
    fetchReferrals();
  }, []);

  const fetchReferralData = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/referral/my-code",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setReferralData(data);
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/referral/my-referrals",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setReferrals(data.referrals);
      }
    } catch (error) {
      console.error("Error fetching referrals:", error);
    }
  };

  const copyReferralCode = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyReferralLink = () => {
    if (referralData?.shareUrl) {
      navigator.clipboard.writeText(referralData.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnWhatsApp = () => {
    const message = `Join Curriculum-Box with my referral code ${referralData.referralCode} and get amazing lesson planning tools! ${referralData.shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="referral-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="referral-container">
      <div className="referral-header">
        <h1>Referral Program</h1>
        <p>Refer 3 teachers and get 1 month free premium subscription!</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">
            <Users size={32} />
          </div>
          <div className="stat-info">
            <h3>{referralData?.stats?.totalReferrals || 0}</h3>
            <p>Total Referrals</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <Check size={32} />
          </div>
          <div className="stat-info">
            <h3>{referralData?.stats?.successfulReferrals || 0}</h3>
            <p>Premium Subscribers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon gift">
            <Gift size={32} />
          </div>
          <div className="stat-info">
            <h3>{referralData?.stats?.freeMonthsEarned || 0}</h3>
            <p>Free Months Earned</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <TrendingUp size={32} />
          </div>
          <div className="stat-info">
            <h3>{referralData?.stats?.nextRewardIn || 3}</h3>
            <p>Referrals Until Next Reward</p>
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="referral-code-section">
        <h2>Your Referral Code</h2>
        <div className="code-box">
          <div className="code">
            {referralData?.referralCode || "Loading..."}
          </div>
          <button onClick={copyReferralCode} className="copy-btn">
            {copied ? <Check size={20} /> : <Copy size={20} />}
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>

        <div className="share-section">
          <h3>Share Your Link</h3>
          <div className="link-box">
            <input
              type="text"
              value={referralData?.shareUrl || ""}
              readOnly
              className="share-link"
            />
            <button onClick={copyReferralLink} className="copy-link-btn">
              <Copy size={18} />
            </button>
          </div>

          <div className="share-buttons">
            <button onClick={shareOnWhatsApp} className="share-btn whatsapp">
              <Share2 size={18} />
              Share on WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Share Your Code</h4>
            <p>Give your referral code to other teachers</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>They Subscribe</h4>
            <p>When they sign up and subscribe to premium</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Earn Rewards</h4>
            <p>Get 1 free month for every 3 successful referrals</p>
          </div>
        </div>
      </div>

      {/* Referrals List */}
      <div className="referrals-list">
        <h2>Your Referrals ({referrals.length})</h2>
        {referrals.length === 0 ? (
          <div className="no-referrals">
            <Users size={48} />
            <p>No referrals yet. Start sharing your code!</p>
          </div>
        ) : (
          <div className="referral-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral, index) => (
                  <tr key={index}>
                    <td>{referral.name}</td>
                    <td>{referral.email}</td>
                    <td>{new Date(referral.joinedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${referral.status}`}>
                        {referral.status === "completed"
                          ? "✓ Premium"
                          : "⏳ Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .referral-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 20px;
          background: #f8faf9;
          min-height: 100vh;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          color: #6b7280;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e5e7eb;
          border-top-color: #2d5f3f;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading p {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
        }

        .referral-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .referral-header h1 {
          font-size: 38px;
          color: #1f2937;
          margin-bottom: 12px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .referral-header p {
          font-size: 17px;
          color: #6b7280;
          font-weight: 400;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: #ffffff;
          padding: 28px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 2px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
        }

        .stat-icon.users {
          background: linear-gradient(135deg, #2d5f3f 0%, #1e4d2b 100%);
        }

        .stat-icon.success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .stat-icon.gift {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .stat-icon.pending {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        }

        .stat-info h3 {
          font-size: 34px;
          margin: 0;
          color: #1f2937;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .stat-info p {
          margin: 6px 0 0 0;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }

        .referral-code-section {
          background: #ffffff;
          padding: 32px;
          border-radius: 16px;
          margin-bottom: 40px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 2px solid #e5e7eb;
        }

        .referral-code-section h2 {
          margin: 0 0 24px 0;
          color: #1f2937;
          font-size: 24px;
          font-weight: 700;
        }

        .code-box {
          display: flex;
          gap: 12px;
          margin-bottom: 36px;
        }

        .code {
          flex: 1;
          background: linear-gradient(135deg, #2d5f3f 0%, #1e4d2b 100%);
          color: #ffffff;
          padding: 24px;
          border-radius: 12px;
          font-size: 32px;
          font-weight: 800;
          text-align: center;
          letter-spacing: 3px;
          box-shadow: 0 4px 16px rgba(45, 95, 63, 0.2);
        }

        .copy-btn {
          background: #10b981;
          color: #ffffff;
          border: none;
          padding: 16px 28px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          transition: all 0.3s ease;
          font-size: 15px;
        }

        .copy-btn:hover {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
        }

        .share-section h3 {
          margin: 0 0 16px 0;
          color: #1f2937;
          font-size: 18px;
          font-weight: 600;
        }

        .link-box {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .share-link {
          flex: 1;
          padding: 14px;
          border: 2px solid #d1d5db;
          border-radius: 10px;
          font-size: 14px;
          color: #6b7280;
          background: #f9fafb;
          font-weight: 500;
        }

        .copy-link-btn {
          background: #f9fafb;
          border: 2px solid #d1d5db;
          padding: 14px 18px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #6b7280;
        }

        .copy-link-btn:hover {
          background: #ffffff;
          border-color: #2d5f3f;
          color: #2d5f3f;
        }

        .share-buttons {
          display: flex;
          gap: 12px;
        }

        .share-btn {
          flex: 1;
          background: #25D366;
          color: #ffffff;
          border: none;
          padding: 14px 24px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 700;
          transition: all 0.3s ease;
          font-size: 15px;
        }

        .share-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(37, 211, 102, 0.3);
        }

        .how-it-works {
          background: #ffffff;
          padding: 32px;
          border-radius: 16px;
          margin-bottom: 40px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 2px solid #e5e7eb;
        }

        .how-it-works h2 {
          text-align: center;
          margin: 0 0 36px 0;
          color: #1f2937;
          font-size: 28px;
          font-weight: 700;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 32px;
        }

        .step {
          text-align: center;
        }

        .step-number {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #2d5f3f 0%, #1e4d2b 100%);
          color: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 800;
          margin: 0 auto 16px;
          box-shadow: 0 4px 12px rgba(45, 95, 63, 0.2);
        }

        .step h4 {
          margin: 0 0 12px 0;
          color: #1f2937;
          font-size: 18px;
          font-weight: 700;
        }

        .step p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }

        .referrals-list {
          background: #ffffff;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 2px solid #e5e7eb;
        }

        .referrals-list h2 {
          margin: 0 0 24px 0;
          color: #1f2937;
          font-size: 24px;
          font-weight: 700;
        }

        .no-referrals {
          text-align: center;
          padding: 60px 20px;
          color: #9ca3af;
        }

        .no-referrals svg {
          margin-bottom: 16px;
          color: #d1d5db;
        }

        .no-referrals p {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
        }

        .referral-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 14px;
          background: #f9fafb;
          color: #6b7280;
          font-weight: 700;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e5e7eb;
        }

        td {
          padding: 16px 14px;
          border-bottom: 1px solid #f3f4f6;
          color: #374151;
          font-weight: 500;
        }

        tr:hover {
          background: #f9fafb;
        }

        .status-badge {
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          display: inline-block;
        }

        .status-badge.completed {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .code-box {
            flex-direction: column;
          }

          .steps {
            grid-template-columns: 1fr;
          }

          .referral-header h1 {
            font-size: 30px;
          }
        }
      `}</style>
    </div>
  );
};

export default ReferralDashboard;
