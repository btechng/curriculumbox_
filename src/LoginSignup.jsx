import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  School,
  Phone,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Gift,
  Eye,
  EyeOff,
  GraduationCap,
  FileText,
  Zap,
  Shield,
} from "lucide-react";

// ── Small helper component ───────────────────────────────────────────────────
const Field = ({ label, icon, children }) => (
  <div style={s.fieldGroup}>
    <label style={s.label}>{label}</label>
    <div style={s.inputWrapper}>
      <span style={s.inputIcon}>{icon}</span>
      {children}
    </div>
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────
const LoginSignup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    school: "",
    role: "teacher",
    referralCode: "",
  });
  const [referralInfo, setReferralInfo] = useState(null);
  const [referralValidating, setReferralValidating] = useState(false);

  // Pick up ?ref= from URL
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      setFormData((p) => ({ ...p, referralCode: refCode }));
      validateReferralCode(refCode);
      setIsLogin(false);
    }
  }, [searchParams]);

  const validateReferralCode = async (code) => {
    if (!code) {
      setReferralInfo(null);
      return;
    }
    setReferralValidating(true);
    try {
      const res = await fetch(
        `https://curriculumbox-backend.onrender.com/api/referral/validate/${code}`,
      );
      const data = await res.json();
      setReferralInfo(
        data.valid
          ? {
              valid: true,
              referrerName: data.referrer.name,
              message: data.message,
            }
          : { valid: false, message: data.message },
      );
    } catch {
      setReferralInfo(null);
    } finally {
      setReferralValidating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "referralCode") {
      if (value.length >= 6) validateReferralCode(value);
      else setReferralInfo(null);
    }
  };

  // ── Login ────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        "https://curriculumbox-backend.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          navigate("/dashboard");
          window.location.reload();
        }, 1000);
      } else if (data.requiresVerification) {
        navigate("/verify-email", {
          state: { userId: data.userId, email: data.email, name: data.name },
        });
      } else {
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Signup ───────────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        "https://curriculumbox-backend.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            school: formData.school,
            role: formData.role,
            referralCode: formData.referralCode || undefined,
          }),
        },
      );
      const data = await res.json();
      if (data.success && data.requiresVerification) {
        navigate("/verify-email", {
          state: { userId: data.userId, email: data.email, name: data.name },
        });
      } else if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
        window.location.reload();
      } else {
        setError(data.message || "Signup failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <FileText size={18} />,
      text: "Generate 10–12 page lesson notes instantly",
    },
    { icon: <Zap size={18} />, text: "Auto-create assessment questions" },
    {
      icon: <GraduationCap size={18} />,
      text: "NERDC-aligned curriculum for all classes",
    },
    { icon: <Shield size={18} />, text: "Export professional PDFs in seconds" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ls-input:focus {
          outline: none;
          border-color: #059669 !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(5,150,105,0.12) !important;
        }
        .ls-input::placeholder { color: #94a3b8; }

        .ls-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(5,150,105,0.35) !important;
        }
        .ls-submit:active:not(:disabled) { transform: translateY(0); }
        .ls-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .ls-role-btn:hover { border-color: #059669 !important; background: #f0fdf4 !important; }

        details > summary { list-style: none; cursor: pointer; }
        details > summary::-webkit-details-marker { display: none; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .ls-left  { display: none !important; }
          .ls-right { padding: 2rem 1.25rem !important; }
        }
        @media (max-width: 480px) {
          .ls-card  { padding: 1.75rem 1.25rem !important; border-radius: 16px !important; }
          .ls-right { padding: 1.5rem 1rem !important; background: #fff !important; }
          .ls-h2    { font-size: 1.4rem !important; }
        }
      `}</style>

      <div style={s.page}>
        {/* ── LEFT PANEL ─────────────────────────────────── */}
        <div className="ls-left" style={s.left}>
          {/* Overlay sits on top of background image */}
          <div style={s.overlay} />
          <div style={s.leftInner}>
            {/* Logo */}
            <div style={s.logoRow}>
              <div style={s.logoBox}>
                <BookOpen size={26} color="#fff" />
              </div>
              <span style={s.logoLabel}>Curriculum-Box</span>
            </div>

            {/* Headline */}
            <div>
              <h1 style={s.h1}>
                Plan smarter.
                <br />
                Teach better.
              </h1>
              <p style={s.tagline}>
                Nigeria's #1 lesson planning platform for primary and secondary
                school teachers.
              </p>
            </div>

            {/* Features */}
            <div style={s.features}>
              {features.map((f, i) => (
                <div key={i} style={s.featureRow}>
                  <div style={s.featureIconBox}>{f.icon}</div>
                  <span style={s.featureLabel}>{f.text}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div style={s.pill}>✦ Trusted by 2,000+ Nigerian teachers</div>
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────── */}
        <div className="ls-right" style={s.right}>
          <div className="ls-card" style={s.card}>
            {/* Mobile logo (hidden on desktop via media query) */}
            <div style={s.mobileLogo}>
              <BookOpen size={22} color="#059669" />
              <span style={s.mobileLogoText}>Curriculum-Box</span>
            </div>

            {/* Tab toggle */}
            <div style={s.tabs}>
              <button
                style={{ ...s.tab, ...(isLogin ? s.tabOn : s.tabOff) }}
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                  setSuccess("");
                }}
              >
                Sign In
              </button>
              <button
                style={{ ...s.tab, ...(!isLogin ? s.tabOn : s.tabOff) }}
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                  setSuccess("");
                }}
              >
                Create Account
              </button>
            </div>

            <h2 className="ls-h2" style={s.h2}>
              {isLogin ? "Welcome back 👋" : "Join Curriculum-Box"}
            </h2>
            <p style={s.sub}>
              {isLogin
                ? "Sign in to access your curriculum dashboard"
                : "Start planning better lessons today — it's free"}
            </p>

            {/* Referral banner */}
            {!isLogin && referralInfo?.valid && (
              <div style={s.refBanner}>
                <Gift size={15} />
                <span>{referralInfo.message}</span>
              </div>
            )}

            {/* Alerts */}
            {error && (
              <div style={s.alertErr}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div style={s.alertOk}>
                <CheckCircle size={15} />
                <span>{success}</span>
              </div>
            )}

            {/* ── LOGIN ── */}
            {isLogin ? (
              <form onSubmit={handleLogin} style={s.form}>
                <Field label="Email address" icon={<Mail size={15} />}>
                  <input
                    className="ls-input"
                    style={s.input}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@school.com"
                    required
                  />
                </Field>

                <Field label="Password" icon={<Lock size={15} />}>
                  <div style={{ position: "relative" }}>
                    <input
                      className="ls-input"
                      style={{ ...s.input, paddingRight: 42 }}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      style={s.eyeBtn}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>

                <button
                  className="ls-submit"
                  type="submit"
                  style={s.submit}
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Sign In →"}
                </button>
                <p style={s.switchLine}>
                  Don't have an account?{" "}
                  <span
                    style={s.switchLink}
                    onClick={() => {
                      setIsLogin(false);
                      setError("");
                    }}
                  >
                    Sign up free
                  </span>
                </p>
              </form>
            ) : (
              /* ── SIGNUP ── */
              <form onSubmit={handleSignup} style={s.form}>
                <Field label="Full name *" icon={<User size={15} />}>
                  <input
                    className="ls-input"
                    style={s.input}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Mrs. Ada Okafor"
                    required
                  />
                </Field>

                <Field label="Email address *" icon={<Mail size={15} />}>
                  <input
                    className="ls-input"
                    style={s.input}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@school.com"
                    required
                  />
                </Field>

                <Field label="Password *" icon={<Lock size={15} />}>
                  <div style={{ position: "relative" }}>
                    <input
                      className="ls-input"
                      style={{ ...s.input, paddingRight: 42 }}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      style={s.eyeBtn}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>

                {/* Role */}
                <div style={s.fieldGroup}>
                  <label style={s.label}>I am a *</label>
                  <div style={s.roleRow}>
                    {[
                      { value: "teacher", label: "Teacher" },
                      {
                        value: "proprietress",
                        label: "School Owner / Principal",
                      },
                    ].map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        className="ls-role-btn"
                        style={{
                          ...s.roleBtn,
                          ...(formData.role === r.value ? s.roleBtnOn : {}),
                        }}
                        onClick={() =>
                          setFormData({ ...formData, role: r.value })
                        }
                      >
                        {formData.role === r.value && (
                          <CheckCircle
                            size={13}
                            color="#059669"
                            style={{ marginRight: 6 }}
                          />
                        )}
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional extras */}
                <details style={s.details}>
                  <summary style={s.detailsSummary}>
                    + Optional details (phone, school, referral code)
                  </summary>
                  <div style={s.detailsBody}>
                    <Field label="Phone number" icon={<Phone size={15} />}>
                      <input
                        className="ls-input"
                        style={s.input}
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="080XXXXXXXX"
                      />
                    </Field>
                    <Field label="School name" icon={<School size={15} />}>
                      <input
                        className="ls-input"
                        style={s.input}
                        type="text"
                        name="school"
                        value={formData.school}
                        onChange={handleChange}
                        placeholder="Your school name"
                      />
                    </Field>
                    <Field label="Referral code" icon={<Gift size={15} />}>
                      <input
                        className="ls-input"
                        style={s.input}
                        type="text"
                        name="referralCode"
                        value={formData.referralCode}
                        onChange={handleChange}
                        placeholder="Enter code"
                        maxLength={12}
                      />
                    </Field>
                    {referralValidating && <p style={s.hint}>Validating…</p>}
                    {referralInfo?.valid && (
                      <p style={{ ...s.hint, color: "#059669" }}>
                        ✓ Valid — from {referralInfo.referrerName}
                      </p>
                    )}
                    {referralInfo?.valid === false && (
                      <p style={{ ...s.hint, color: "#dc2626" }}>
                        ✗ Invalid referral code
                      </p>
                    )}
                  </div>
                </details>

                <button
                  className="ls-submit"
                  type="submit"
                  style={s.submit}
                  disabled={loading}
                >
                  {loading ? "Creating account…" : "Create Account →"}
                </button>
                <p style={s.switchLine}>
                  Already have an account?{" "}
                  <span
                    style={s.switchLink}
                    onClick={() => {
                      setIsLogin(true);
                      setError("");
                    }}
                  >
                    Sign in
                  </span>
                </p>
              </form>
            )}

            <p style={s.terms}>
              By continuing you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Style object ─────────────────────────────────────────────────────────────
const G = "#059669";
const GD = "#047857";

const s = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'DM Sans', -apple-system, sans-serif",
  },

  /* Left */
  left: {
    flex: "0 0 44%",
    position: "relative",
    // ↓ Change this path to match your actual image filename
    backgroundImage: "url('../public/images/background.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "#022c22", // fallback if image missing
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(160deg, rgba(4,78,58,0.87) 0%, rgba(2,40,28,0.95) 100%)",
    zIndex: 1,
  },
  leftInner: {
    position: "relative",
    zIndex: 2,
    height: "100%",
    padding: "3rem 2.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "2rem",
  },
  logoRow: { display: "flex", alignItems: "center", gap: 10 },
  logoBox: {
    width: 42,
    height: 42,
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoLabel: {
    color: "#fff",
    fontSize: 19,
    fontWeight: 700,
    letterSpacing: "-0.3px",
  },
  h1: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "2.3rem",
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1.2,
    margin: "0 0 10px",
  },
  tagline: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 14.5,
    lineHeight: 1.65,
  },
  features: { display: "flex", flexDirection: "column", gap: 12 },
  featureRow: { display: "flex", alignItems: "center", gap: 12 },
  featureIconBox: {
    width: 34,
    height: 34,
    flexShrink: 0,
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6ee7b7",
  },
  featureLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13.5,
    lineHeight: 1.4,
  },
  pill: {
    alignSelf: "flex-start",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#a7f3d0",
    padding: "7px 14px",
    borderRadius: 999,
    fontSize: 12.5,
    fontWeight: 500,
  },

  /* Right */
  right: {
    flex: 1,
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2.5rem 1.5rem",
    overflowY: "auto",
  },
  card: {
    width: "100%",
    maxWidth: 460,
    background: "#fff",
    borderRadius: 20,
    padding: "2.25rem 2rem",
    boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
    border: "1px solid #e2e8f0",
  },
  mobileLogo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    // Hidden on desktop via media — show on mobile only
  },
  mobileLogoText: { fontSize: 17, fontWeight: 700, color: "#1e293b" },

  /* Tabs */
  tabs: {
    display: "flex",
    background: "#f1f5f9",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: "9px 0",
    border: "none",
    borderRadius: 7,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabOn: {
    background: "#fff",
    color: G,
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },
  tabOff: { background: "transparent", color: "#64748b" },

  h2: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.55rem",
    fontWeight: 700,
    color: "#1e293b",
    margin: "0 0 5px",
  },
  sub: { color: "#64748b", fontSize: 13.5, margin: "0 0 18px" },

  /* Banners */
  refBanner: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    padding: "9px 12px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 14,
  },
  alertErr: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    padding: "9px 12px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 14,
  },
  alertOk: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    padding: "9px 12px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 14,
  },

  /* Form */
  form: { display: "flex", flexDirection: "column", gap: 14 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 12.5, fontWeight: 600, color: "#374151" },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: {
    position: "absolute",
    left: 11,
    color: "#94a3b8",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "10px 11px 10px 36px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 13.5,
    fontFamily: "'DM Sans', sans-serif",
    color: "#1e293b",
    background: "#fafafa",
    transition: "all 0.2s",
  },
  eyeBtn: {
    position: "absolute",
    right: 11,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    padding: 2,
  },

  /* Role */
  roleRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  roleBtn: {
    flex: 1,
    minWidth: 100,
    padding: "9px 10px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    background: "#fafafa",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  roleBtnOn: {
    border: `1.5px solid ${G}`,
    background: "#f0fdf4",
    color: GD,
    fontWeight: 600,
  },

  /* Optional collapsible */
  details: {
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  detailsSummary: {
    padding: "9px 13px",
    fontSize: 13,
    fontWeight: 600,
    color: "#64748b",
    background: "#f8fafc",
    userSelect: "none",
  },
  detailsBody: {
    padding: "14px 13px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: 13,
  },
  hint: { marginTop: 4, fontSize: 11.5, color: "#94a3b8" },

  /* Submit */
  submit: {
    width: "100%",
    padding: "12px",
    background: `linear-gradient(135deg, ${G} 0%, ${GD} 100%)`,
    color: "#fff",
    border: "none",
    borderRadius: 9,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    marginTop: 2,
    transition: "all 0.25s",
    letterSpacing: "0.2px",
  },

  switchLine: {
    textAlign: "center",
    fontSize: 12.5,
    color: "#64748b",
    marginTop: 2,
  },
  switchLink: {
    color: G,
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "underline",
  },
  terms: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 11,
    color: "#94a3b8",
    lineHeight: 1.5,
  },
};

export default LoginSignup;
