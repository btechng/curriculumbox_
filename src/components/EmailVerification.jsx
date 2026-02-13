// EMAIL VERIFICATION COMPONENT
// File: client/src/components/EmailVerification.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  Loader,
  RefreshCw,
} from "lucide-react";
import "./EmailVerification.css";

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get user info from registration
  const { userId, email, name } = location.state || {};

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Redirect if no user info
    if (!userId || !email) {
      navigate("/register");
      return;
    }

    // Countdown timer for resend
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown, userId, email, navigate]);

  // Handle input change
  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-submit when all fields filled
    if (newCode.every((digit) => digit !== "")) {
      handleVerify(newCode.join(""));
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split("");
      setCode(newCode);

      // Focus last input
      const lastInput = document.getElementById("code-5");
      if (lastInput) lastInput.focus();

      // Auto-verify
      handleVerify(pastedData);
    }
  };

  // Verify email
  const handleVerify = async (verificationCode) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://curriculumbox-backend.onrender.com/api/auth/verify-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            code: verificationCode,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);

        // Store token
        localStorage.setItem("token", data.token);

        // Show success briefly then redirect
        setTimeout(() => {
          navigate("/dashboard", {
            state: {
              message:
                "Email verified successfully! Welcome to Curriculum-Box!",
            },
          });
        }, 1500);
      } else {
        setError(data.message || "Invalid verification code");
        setCode(["", "", "", "", "", ""]);

        // Focus first input
        const firstInput = document.getElementById("code-0");
        if (firstInput) firstInput.focus();
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Resend code
  const handleResend = async () => {
    setResending(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, email }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setCountdown(60);
        setCanResend(false);
        setCode(["", "", "", "", "", ""]);

        // Show success message
        const successMsg = document.createElement("div");
        successMsg.className = "resend-success";
        successMsg.textContent = "✅ New code sent to your email!";
        document
          .querySelector(".verification-container")
          .appendChild(successMsg);

        setTimeout(() => successMsg.remove(), 3000);
      } else {
        setError(data.message || "Failed to resend code");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Resend error:", error);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verification-page">
      <div className="verification-container">
        {/* Header */}
        <div className="verification-header">
          <div className={`icon-circle ${success ? "success" : ""}`}>
            {success ? <CheckCircle size={40} /> : <Mail size={40} />}
          </div>

          <h1>{success ? "Email Verified!" : "Verify Your Email"}</h1>

          <p className="verification-subtitle">
            {success ? (
              "Redirecting you to your dashboard..."
            ) : (
              <>
                We've sent a 6-digit code to
                <br />
                <strong>{email}</strong>
              </>
            )}
          </p>
        </div>

        {!success && (
          <>
            {/* Code Input */}
            <div className="code-input-container">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`code-input ${error ? "error" : ""}`}
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Loading */}
            {loading && (
              <div className="verification-loading">
                <Loader className="spinner" size={20} />
                <span>Verifying...</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="verification-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Resend Code */}
            <div className="resend-container">
              <p className="resend-text">Didn't receive the code?</p>

              {canResend ? (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="resend-btn"
                >
                  {resending ? (
                    <>
                      <Loader className="spinner-small" size={16} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      Resend Code
                    </>
                  )}
                </button>
              ) : (
                <p className="countdown-text">
                  Resend in <strong>{countdown}s</strong>
                </p>
              )}
            </div>

            {/* Tips */}
            <div className="verification-tips">
              <h4>📧 Tips:</h4>
              <ul>
                <li>Check your spam/junk folder</li>
                <li>Make sure you entered the correct email</li>
                <li>The code expires in 10 minutes</li>
                <li>You can paste the entire code at once</li>
              </ul>
            </div>
          </>
        )}

        {/* Success Animation */}
        {success && (
          <div className="success-animation">
            <div className="checkmark-circle">
              <div className="checkmark draw"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
