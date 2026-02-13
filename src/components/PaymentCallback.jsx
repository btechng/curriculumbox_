import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const reference = searchParams.get("reference");

    if (!reference) {
      setStatus("failed");
      setMessage("Invalid payment reference. Please try again.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/payment/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(
          "Payment successful! Your premium subscription is now active.",
        );
        setDetails(data.subscription);

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate("/dashboard");
          window.location.reload(); // Refresh to update user state
        }, 3000);
      } else {
        setStatus("failed");
        setMessage(
          data.message ||
            "Payment verification failed. Please contact support.",
        );
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setStatus("failed");
      setMessage(
        "Error verifying payment. Please contact support with your reference number.",
      );
    }
  };

  return (
    <div className="callback-container">
      <div className="callback-card">
        {status === "verifying" && (
          <>
            <Loader size={64} className="spinner" />
            <h2>Verifying Payment...</h2>
            <p>Please wait while we confirm your payment</p>
            <p className="reference">
              Reference: {searchParams.get("reference")}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle size={64} className="success-icon" />
            <h2>Payment Successful!</h2>
            <p className="success-message">{message}</p>

            {details && (
              <div className="subscription-details">
                <h3>Subscription Details</h3>
                <div className="detail-row">
                  <span>Status:</span>
                  <strong>{details.status}</strong>
                </div>
                <div className="detail-row">
                  <span>Plan:</span>
                  <strong>{details.plan}</strong>
                </div>
                <div className="detail-row">
                  <span>Valid Until:</span>
                  <strong>
                    {new Date(details.endDate).toLocaleDateString()}
                  </strong>
                </div>
              </div>
            )}

            <p className="redirect">Redirecting to dashboard...</p>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle size={64} className="error-icon" />
            <h2>Payment Failed</h2>
            <p className="error-message">{message}</p>
            <div className="error-actions">
              <button
                onClick={() => navigate("/pricing")}
                className="retry-btn"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="dashboard-btn"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .callback-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .callback-card {
          background: white;
          padding: 60px 40px;
          border-radius: 12px;
          text-align: center;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .spinner {
          color: #667eea;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .success-icon {
          color: #10b981;
          margin-bottom: 20px;
        }

        .error-icon {
          color: #ef4444;
          margin-bottom: 20px;
        }

        h2 {
          margin: 20px 0 10px 0;
          font-size: 28px;
          color: #2d3748;
        }

        p {
          color: #6b7280;
          margin: 10px 0;
          font-size: 16px;
        }

        .reference {
          font-size: 14px;
          color: #9ca3af;
          font-family: monospace;
          margin-top: 15px;
        }

        .success-message {
          color: #10b981;
          font-weight: 500;
          font-size: 18px;
        }

        .error-message {
          color: #ef4444;
          font-weight: 500;
          font-size: 18px;
        }

        .subscription-details {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
          text-align: left;
        }

        .subscription-details h3 {
          margin: 0 0 15px 0;
          font-size: 18px;
          color: #2d3748;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row span {
          color: #6b7280;
        }

        .detail-row strong {
          color: #2d3748;
        }

        .redirect {
          color: #667eea;
          font-weight: 600;
          margin-top: 20px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .error-actions {
          display: flex;
          gap: 10px;
          margin-top: 25px;
          justify-content: center;
        }

        .retry-btn, .dashboard-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .retry-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        .dashboard-btn {
          background: #f3f4f6;
          color: #4b5563;
        }

        .dashboard-btn:hover {
          background: #e5e7eb;
        }

        @media (max-width: 768px) {
          .callback-card {
            padding: 40px 20px;
          }

          h2 {
            font-size: 24px;
          }

          .error-actions {
            flex-direction: column;
          }

          .retry-btn, .dashboard-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentCallback;
