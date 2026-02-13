import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { Check, X, Users, Gift, Zap, TrendingUp } from "lucide-react";

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState("yearly");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/payment/initialize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ plan }),
        },
      );

      const data = await response.json();

      if (data.success) {
        window.location.href = data.authorizationUrl;
      } else {
        alert("Payment initialization failed: " + data.message);
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/payment/start-trial",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        navigate("/dashboard");
        window.location.reload();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1>Choose Your Plan</h1>
        <p>
          Professional curriculum management and lesson planning tools for
          Nigerian educators
        </p>

        <div className="billing-toggle">
          <button
            className={billingCycle === "monthly" ? "active" : ""}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </button>
          <button
            className={billingCycle === "yearly" ? "active" : ""}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly <span className="save-badge">Save ₦7,000!</span>
          </button>
        </div>
      </div>

      {/* Referral Banner */}
      <div className="referral-banner">
        <Gift size={28} />
        <div>
          <h3>Refer 3 Teachers, Get 1 Month FREE!</h3>
          <p>
            Share your referral code and earn free premium months when your
            friends subscribe
          </p>
        </div>
      </div>

      <div className="pricing-cards">
        {/* FREE TIER */}
        <div className="pricing-card">
          <div className="card-header">
            <h3>Free</h3>
            <div className="price">
              <span className="amount">₦0</span>
              <span className="period">/forever</span>
            </div>
          </div>

          <ul className="features">
            <li>
              <Check size={20} /> Browse all curriculum
            </li>
            <li>
              <Check size={20} /> View scheme of work
            </li>
            <li>
              <Check size={20} /> See weekly topics
            </li>
            <li>
              <Check size={20} /> Basic dashboard
            </li>
            <li>
              <X size={20} className="unavailable" /> Generate lesson plans
            </li>
            <li>
              <X size={20} className="unavailable" /> Generate questions
            </li>
            <li>
              <X size={20} className="unavailable" /> Export to PDF/Word
            </li>
            <li>
              <X size={20} className="unavailable" /> AI Teaching Assistant
            </li>
          </ul>

          <button
            className="btn-secondary"
            disabled={user?.subscriptionStatus === "free"}
          >
            {user ? "Current Plan" : "Get Started Free"}
          </button>
        </div>

        {/* PREMIUM TIER */}
        <div className="pricing-card premium">
          <div className="popular-badge">Most Popular</div>
          <div className="card-header">
            <h3>Premium</h3>
            <div className="price">
              <span className="amount">
                {billingCycle === "monthly" ? "₦1,000" : "₦5,000"}
              </span>
              <span className="period">
                /{billingCycle === "monthly" ? "month" : "year"}
              </span>
            </div>
            {billingCycle === "yearly" && (
              <p className="savings">
                <TrendingUp size={16} /> Save ₦7,000 per year!
              </p>
            )}
            {billingCycle === "monthly" && (
              <p className="monthly-note">Only ₦33 per day!</p>
            )}
          </div>

          <ul className="features">
            <li>
              <Check size={20} /> <strong>Everything in Free</strong>
            </li>
            <li>
              <Check size={20} /> <strong>Unlimited</strong> lesson plan
              generation
            </li>
            <li>
              <Check size={20} /> <strong>Unlimited</strong> question generation
            </li>
            <li>
              <Check size={20} /> Export to PDF & Word
            </li>
            <li>
              <Check size={20} /> AI Teaching Assistant
            </li>
            <li>
              <Check size={20} /> Progress tracking
            </li>
            <li>
              <Check size={20} /> Custom templates
            </li>
            <li>
              <Check size={20} /> Priority support
            </li>
          </ul>

          <button
            className="btn-primary"
            onClick={() => handleSubscribe(billingCycle)}
            disabled={loading || user?.subscriptionStatus === "premium"}
          >
            {loading
              ? "Processing..."
              : user?.subscriptionStatus === "premium"
                ? "Current Plan"
                : `Subscribe Now - Pay ₦${billingCycle === "monthly" ? "1,000" : "5,000"}`}
          </button>

          <div className="payment-info">
            <p>✅ Secure payment with Paystack</p>
            <p>✅ Cancel anytime • No hidden fees</p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section">
        <h2>Why Go Premium?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <Zap size={36} />
            <h3>Save Time</h3>
            <p>
              Generate professional lesson plans in seconds instead of hours
            </p>
          </div>
          <div className="benefit-card">
            <Check size={36} />
            <h3>NERDC Compliant</h3>
            <p>All content aligned with Nigerian curriculum standards</p>
          </div>
          <div className="benefit-card">
            <Users size={36} />
            <h3>Join 500+ Teachers</h3>
            <p>Trusted by teachers across Nigeria to boost productivity</p>
          </div>
          <div className="benefit-card">
            <Gift size={36} />
            <h3>Referral Rewards</h3>
            <p>Get 1 free month for every 3 teachers you refer</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Can I cancel anytime?</h4>
            <p>
              Yes! You can cancel your subscription at any time. Your premium
              access will continue until the end of your billing period.
            </p>
          </div>
          <div className="faq-item">
            <h4>How does the referral program work?</h4>
            <p>
              Share your unique referral code with other teachers. When 3
              teachers subscribe using your code, you get 1 free month of
              premium access!
            </p>
          </div>
          <div className="faq-item">
            <h4>What payment methods do you accept?</h4>
            <p>
              We use Paystack for secure payments. You can pay with cards, bank
              transfer, or USSD.
            </p>
          </div>
          <div className="faq-item">
            <h4>How long is the free trial?</h4>
            <p>
              The free trial lasts 2 days and gives you full access to all
              premium features. No credit card required!
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .pricing-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 44px 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .pricing-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .pricing-header h1 {
          font-size: 42px;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }

        .pricing-header p {
          font-size: 18px;
          color: #6b7280;
          margin-bottom: 36px;
          font-weight: 400;
        }

        .billing-toggle {
          display: inline-flex;
          background: #f3f4f6;
          border-radius: 12px;
          padding: 5px;
          gap: 6px;
        }

        .billing-toggle button {
          padding: 12px 30px;
          border: none;
          background: transparent;
          border-radius: 9px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 700;
          color: #6b7280;
          transition: all 0.3s ease;
          position: relative;
        }

        .billing-toggle button.active {
  background: #ffffff !important;
  color: #2d5f3f !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  pointer-events: auto;
}

        .save-badge {
          display: inline-block;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          font-size: 11px;
          padding: 3px 9px;
          border-radius: 6px;
          margin-left: 8px;
          font-weight: 800;
          letter-spacing: 0.3px;
        }

        .referral-banner {
          background: linear-gradient(135deg, #2d5f3f 0%, #1e4d2b 100%);
          color: #ffffff;
          padding: 22px 28px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 40px;
          box-shadow: 0 8px 24px rgba(45, 95, 63, 0.2);
        }

        .referral-banner svg {
          flex-shrink: 0;
        }

        .referral-banner h3 {
          margin: 0 0 6px 0;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.2px;
        }

        .referral-banner p {
          margin: 0;
          opacity: 0.95;
          font-size: 14px;
          font-weight: 400;
        }

        .pricing-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 28px;
          margin-top: 40px;
        }

        .pricing-card {
          background: #ffffff;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 32px;
          position: relative;
          transition: all 0.3s ease;
        }

        .pricing-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.12);
        }

        .pricing-card.premium {
          border-color: #2d5f3f;
          box-shadow: 0 8px 24px rgba(45, 95, 63, 0.15);
        }

        .popular-badge {
          position: absolute;
          top: -16px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #2d5f3f 0%, #1e4d2b 100%);
          color: #ffffff;
          padding: 6px 24px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.3px;
          box-shadow: 0 4px 12px rgba(45, 95, 63, 0.3);
        }

        .card-header h3 {
          font-size: 26px;
          margin-bottom: 16px;
          color: #1f2937;
          font-weight: 700;
        }

        .price {
          margin-bottom: 12px;
        }

        .price .amount {
          font-size: 40px;
          font-weight: 800;
          color: #2d5f3f;
          letter-spacing: -1px;
        }

        .price .period {
          font-size: 16px;
          color: #6b7280;
          font-weight: 500;
        }

        .savings {
          color: #10b981;
          font-size: 14px;
          margin: 6px 0;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
        }

        .monthly-note {
          color: #2d5f3f;
          font-size: 14px;
          margin: 6px 0;
          font-weight: 600;
        }

        .features {
          list-style: none;
          padding: 0;
          margin: 28px 0;
        }

        .features li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 14px;
          font-weight: 500;
        }

        .features li:last-child {
          border-bottom: none;
        }

        .features li svg {
          color: #10b981;
          flex-shrink: 0;
        }

        .features li .unavailable {
          color: #ef4444;
        }

        .btn-primary, .btn-secondary, .btn-trial {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 12px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #2d5f3f 0%, #1e4d2b 100%);
          color: #ffffff;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(45, 95, 63, 0.3);
        }

        .btn-secondary {
          background: #f9fafb;
          color: #6b7280;
          border: 2px solid #e5e7eb;
          font-weight: 600;
        }

        .btn-trial {
          background: #ffffff;
          color: #2d5f3f;
          border: 2px solid #2d5f3f;
        }

        .btn-trial:hover:not(:disabled) {
          background: #2d5f3f;
          color: #ffffff;
        }

        .btn-primary:disabled, .btn-secondary:disabled, .btn-trial:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .payment-info {
          margin-top: 18px;
          text-align: center;
        }

        .payment-info p {
          margin: 6px 0;
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        .benefits-section {
          margin-top: 72px;
          text-align: center;
        }

        .benefits-section h2 {
          font-size: 34px;
          margin-bottom: 36px;
          color: #1f2937;
          font-weight: 700;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }

        .benefit-card {
          background: #ffffff;
          padding: 32px;
          border-radius: 14px;
          border: 2px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .benefit-card:hover {
          border-color: #2d5f3f;
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }

        .benefit-card svg {
          color: #2d5f3f;
          margin-bottom: 16px;
        }

        .benefit-card h3 {
          font-size: 20px;
          margin-bottom: 12px;
          color: #1f2937;
          font-weight: 700;
        }

        .benefit-card p {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.7;
          font-weight: 400;
        }

        .faq-section {
          margin-top: 72px;
          margin-bottom: 40px;
        }

        .faq-section h2 {
          font-size: 34px;
          margin-bottom: 36px;
          text-align: center;
          color: #1f2937;
          font-weight: 700;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }

        .faq-item {
          background: #ffffff;
          padding: 28px;
          border-radius: 14px;
          border: 2px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .faq-item:hover {
          border-color: #2d5f3f;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }

        .faq-item h4 {
          font-size: 18px;
          margin-bottom: 12px;
          color: #1f2937;
          font-weight: 700;
        }

        .faq-item p {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.7;
          margin: 0;
          font-weight: 400;
        }

        @media (max-width: 768px) {
          .pricing-header h1 {
            font-size: 30px;
          }

          .pricing-cards {
            grid-template-columns: 1fr;
          }

          .benefits-grid, .faq-grid {
            grid-template-columns: 1fr;
          }

          .referral-banner {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Pricing;
