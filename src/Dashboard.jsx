import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  BookOpen,
  GraduationCap,
  Crown,
  Gift,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Zap,
  ChevronDown,
  X,
  AlertCircle,
  Loader,
} from "lucide-react";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Curriculum state
  const [levels, setLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms] = useState(["First Term", "Second Term", "Third Term"]);
  const [weeks, setWeeks] = useState([]);

  // Selected filters
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");

  // Data state
  const [curriculumData, setCurriculumData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal state
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadData, setDownloadData] = useState(null);

  // Generation loading states
  const [generatingLesson, setGeneratingLesson] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  // Subscription state
  const [subscriptionData, setSubscriptionData] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchSubscriptionStatus();
    fetchLevels();
  }, []);

  useEffect(() => {
    if (selectedLevel) {
      fetchSubjectsForLevel(selectedLevel);
      setSelectedSubject("");
      setSelectedTerm("");
      setSelectedWeek("");
      setCurriculumData([]);
    }
  }, [selectedLevel]);

  useEffect(() => {
    if (selectedLevel && selectedSubject && selectedTerm) {
      fetchWeeksForSelection();
    }
  }, [selectedLevel, selectedSubject, selectedTerm]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch(
        "https://curriculumbox-backend.onrender.com/api/payment/subscription/status",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await fetch(
        "https://curriculumbox-backend.onrender.com/api/curriculum/stats",
      );
      const result = await response.json();
      if (result.success && result.stats) {
        setLevels(result.stats.levels || []);
      }
    } catch (error) {
      console.error("Error fetching levels:", error);
    }
  };

  const fetchSubjectsForLevel = async (level) => {
    try {
      const response = await fetch(
        `https://curriculumbox-backend.onrender.com/api/curriculum/subjects?level=${encodeURIComponent(level)}`,
      );
      const result = await response.json();
      if (result.success) {
        setSubjects(result.subjects || []);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchWeeksForSelection = async () => {
    try {
      const params = new URLSearchParams({
        level: selectedLevel,
        subject: selectedSubject,
        term: selectedTerm,
      });

      const response = await fetch(
        `https://curriculumbox-backend.onrender.com/api/curriculum?${params}`,
      );
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const uniqueWeeks = [
          ...new Set(result.data.map((item) => item.week)),
        ].sort((a, b) => a - b);
        setWeeks(uniqueWeeks);
      }
    } catch (error) {
      console.error("Error fetching weeks:", error);
    }
  };

  const handleLoadCurriculum = async () => {
    if (!selectedLevel || !selectedSubject || !selectedTerm) {
      setError("Please select Class, Subject, and Term");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        level: selectedLevel,
        subject: selectedSubject,
        term: selectedTerm,
        ...(selectedWeek && { week: selectedWeek }),
      });

      const response = await fetch(
        `https://curriculumbox-backend.onrender.com/api/curriculum?${params}`,
      );
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setCurriculumData(result.data);
        if (result.data.length === 0) {
          setError("No curriculum found for this selection");
        }
      } else {
        setError("Failed to load curriculum");
      }
    } catch (error) {
      setError("Error loading curriculum: " + error.message);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate Detailed Lesson Note
  const handleGenerateLessonNote = async (scheme) => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    setGeneratingLesson(true);
    try {
      const response = await fetch(
        "https://curriculumbox-backend.onrender.com/api/lesson-notes/generate-detailed",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            level: scheme.level,
            subject: scheme.subject,
            term: scheme.term,
            week: scheme.week,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        // Show download modal instead of auto-download
        setDownloadData({
          type: "Lesson Note",
          fileName: data.fileName,
          description: "10-12 page comprehensive lesson plan",
          scheme: scheme, // Store scheme for PDF export
        });
        setShowDownloadModal(true);

        // Refresh subscription data
        fetchSubscriptionStatus();
      } else if (data.requiresUpgrade) {
        setShowUpgradeModal(true);
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      console.error("Lesson note generation error:", error);
      alert("❌ Error generating lesson note: " + error.message);
    } finally {
      setGeneratingLesson(false);
    }
  };

  // Generate Questions - FIXED
  const handleGenerateQuestions = async (scheme) => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    setGeneratingQuestions(true);
    try {
      const response = await fetch(
        "https://curriculumbox-backend.onrender.com/api/questions/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            level: scheme.level,
            subject: scheme.subject,
            term: scheme.term,
            week: scheme.week,
            topic: scheme.topic,
            content: scheme.content || "",
            questionCount: 20,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        // Show download modal
        setDownloadData({
          type: "Assessment Questions",
          fileName: data.fileName,
          description: "20 questions across 5 sections",
        });
        setShowDownloadModal(true);
        fetchSubscriptionStatus();
      } else if (data.requiresUpgrade) {
        setShowUpgradeModal(true);
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      console.error("Questions generation error:", error);
      alert("❌ Error generating questions: " + error.message);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Export to PDF - FIXED
  const handleExportPDF = async (scheme) => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    setExportingPDF(true);
    try {
      const response = await fetch(
        "https://curriculumbox-backend.onrender.com/api/export/pdf",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            level: scheme.level,
            subject: scheme.subject,
            term: scheme.term,
            week: scheme.week,
            topic: scheme.topic,
            content: scheme.content || "",
            objectives: scheme.objectives || [],
            activities: scheme.activities || [],
            teachingAids: scheme.teachingAids || [],
            assessment: scheme.assessment || "",
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        // Show download modal
        setDownloadData({
          type: "PDF Export",
          fileName: data.fileName,
          description: "Professional curriculum document",
        });
        setShowDownloadModal(true);
        fetchSubscriptionStatus();
      } else if (data.requiresUpgrade) {
        setShowUpgradeModal(true);
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      console.error("PDF export error:", error);
      alert("❌ Error exporting PDF: " + error.message);
    } finally {
      setExportingPDF(false);
    }
  };

  // Handle download from modal
  const handleDownloadFile = () => {
    if (downloadData) {
      // Create a proper download link
      const link = document.createElement("a");
      link.href = `https://curriculumbox-backend.onrender.com/api/lesson-notes/download/${downloadData.fileName}`;
      link.setAttribute("download", downloadData.fileName);
      link.setAttribute("target", "_blank");

      // Add authorization header by using fetch instead
      fetch(
        `https://curriculumbox-backend.onrender.com/api/lesson-notes/download/${downloadData.fileName}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = downloadData.fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          setShowDownloadModal(false);
          setDownloadData(null);
        })
        .catch((error) => {
          console.error("Download error:", error);
          alert("Error downloading file. Please try again.");
        });
    }
  };
  // Export after lesson note generation
  const handleExportAfterGeneration = async () => {
    if (downloadData && downloadData.scheme) {
      setShowDownloadModal(false);
      await handleExportPDF(downloadData.scheme);
    }
  };

  // Export Full Term to PDF
  const handleExportFullTerm = async () => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    if (curriculumData.length === 0) {
      alert("⚠️ Please load curriculum first");
      return;
    }

    setExportingPDF(true);
    try {
      const response = await fetch(
        "https://curriculumbox-backend.onrender.com/api/export/term-pdf",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            level: selectedLevel,
            subject: selectedSubject,
            term: selectedTerm,
            curriculumData: curriculumData,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setDownloadData({
          type: "Full Term PDF",
          fileName: data.fileName,
          description: `${data.totalWeeks} weeks of curriculum in one document`,
        });
        setShowDownloadModal(true);
        fetchSubscriptionStatus();
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      console.error("Full term export error:", error);
      alert("❌ Error exporting full term: " + error.message);
    } finally {
      setExportingPDF(false);
    }
  };

  const isPremium =
    subscriptionData?.subscription?.status === "premium" ||
    subscriptionData?.subscription?.status === "trial";

  const getDaysRemaining = () => {
    if (!subscriptionData?.subscription?.endDate) return 0;
    const now = new Date();
    const end = new Date(subscriptionData.subscription.endDate);
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="dashboard">
      {/* Header - Same as before */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <GraduationCap size={32} />
              <span>Curriculum-Box</span>
            </div>
            <div className="user-welcome">
              <h2>Welcome, {user?.name || "Teacher"}!</h2>
              <p className="user-role">{user?.role || "Teacher"}</p>
            </div>
          </div>

          <div className="header-right">
            {isPremium ? (
              <div className="premium-badge">
                <Crown size={18} />
                <span>Premium</span>
              </div>
            ) : (
              <button
                className="upgrade-btn-header"
                onClick={() => navigate("/pricing")}
              >
                <Zap size={18} />
                Upgrade
              </button>
            )}

            <button
              className="referral-btn"
              onClick={() => navigate("/referral")}
            >
              <Gift size={18} />
              Referrals
            </button>

            <button className="logout-btn" onClick={logout}>
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Sidebar - Same as before */}
        <aside className="sidebar">
          <div
            className={`subscription-card ${isPremium ? "premium" : "free"}`}
          >
            {isPremium ? (
              <>
                <div className="sub-icon premium-icon">
                  <Crown size={24} />
                </div>
                <h3>Premium Active</h3>
                <p className="days-remaining">
                  {getDaysRemaining()} days remaining
                </p>
                <div className="usage-stats">
                  <div className="stat-item">
                    <span className="stat-value">
                      {subscriptionData?.usage?.lessonPlansGenerated || 0}
                    </span>
                    <span className="stat-label">Lesson Notes</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      {subscriptionData?.usage?.questionsGenerated || 0}
                    </span>
                    <span className="stat-label">Questions</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      {subscriptionData?.usage?.exportsCount || 0}
                    </span>
                    <span className="stat-label">PDF Exports</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="sub-icon free-icon">
                  <BookOpen size={24} />
                </div>
                <h3>Free Account</h3>
                <p className="upgrade-text">Unlock premium features</p>
                <button
                  className="upgrade-btn-card"
                  onClick={() => navigate("/pricing")}
                >
                  <Crown size={18} />
                  Upgrade to Premium
                </button>
                <div className="pricing-preview">
                  <div className="price-item">
                    <span>Monthly</span>
                    <strong>₦1,000</strong>
                  </div>
                  <div className="price-item highlighted">
                    <span>Yearly</span>
                    <strong>₦5,000</strong>
                    <small>Save ₦7,000</small>
                  </div>
                </div>
              </>
            )}
          </div>

          {subscriptionData?.referral && (
            <div className="referral-card">
              <div className="referral-header">
                <Gift size={20} />
                <h4>Referral Rewards</h4>
              </div>
              <div className="referral-stats">
                <div className="referral-stat">
                  <span className="referral-number">
                    {subscriptionData.referral.successfulReferrals}
                  </span>
                  <span className="referral-label">Successful</span>
                </div>
                <div className="referral-stat">
                  <span className="referral-number">
                    {subscriptionData.referral.freeMonthsEarned}
                  </span>
                  <span className="referral-label">Free Months</span>
                </div>
              </div>
              <p className="referral-progress">
                {3 - (subscriptionData.referral.successfulReferrals % 3)} more
                to next free month
              </p>
              <button
                className="view-referrals-btn"
                onClick={() => navigate("/referral")}
              >
                View Details
              </button>
            </div>
          )}

          <div className="quick-stats">
            <h4>Curriculum Database</h4>
            <div className="stat-list">
              <div className="stat-row">
                <span>Classes:</span>
                <strong>12</strong>
              </div>
              <div className="stat-row">
                <span>Subjects:</span>
                <strong>30+</strong>
              </div>
              <div className="stat-row">
                <span>Total Entries:</span>
                <strong>6,500+</strong>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area - Same filters and curriculum display as before */}
        <main className="content">
          <div className="filters-section">
            <div className="section-header">
              <h2>
                <BookOpen size={24} />
                Browse Curriculum
              </h2>
              <p>Select your class, subject, and term to view scheme of work</p>
            </div>

            <div className="filters-grid">
              <div className="filter-item">
                <label>
                  Class Level <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Select Class</option>
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="select-icon" size={18} />
                </div>
              </div>

              <div className="filter-item">
                <label>
                  Subject <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="filter-select"
                    disabled={!selectedLevel}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="select-icon" size={18} />
                </div>
              </div>

              <div className="filter-item">
                <label>
                  Term <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Select Term</option>
                    {terms.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="select-icon" size={18} />
                </div>
              </div>

              <div className="filter-item">
                <label>Week (Optional)</label>
                <div className="select-wrapper">
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="filter-select"
                    disabled={
                      !selectedLevel || !selectedSubject || !selectedTerm
                    }
                  >
                    <option value="">All Weeks</option>
                    {weeks.map((week) => (
                      <option key={week} value={week}>
                        Week {week}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="select-icon" size={18} />
                </div>
              </div>
            </div>

            <div className="filter-actions">
              <button
                className="load-curriculum-btn"
                onClick={handleLoadCurriculum}
                disabled={
                  !selectedLevel || !selectedSubject || !selectedTerm || loading
                }
              >
                {loading ? (
                  <>
                    <Loader className="spinner-small" size={18} />
                    Loading...
                  </>
                ) : (
                  <>
                    <BookOpen size={18} />
                    Load Curriculum
                  </>
                )}
              </button>

              {curriculumData.length > 0 && (
                <button
                  className="export-term-btn"
                  onClick={handleExportFullTerm}
                  disabled={exportingPDF}
                >
                  {exportingPDF ? (
                    <>
                      <Loader className="spinner-small" size={18} />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Export Full Term (PDF)
                    </>
                  )}
                </button>
              )}

              {(selectedLevel ||
                selectedSubject ||
                selectedTerm ||
                selectedWeek) && (
                <button
                  className="clear-btn"
                  onClick={() => {
                    setSelectedLevel("");
                    setSelectedSubject("");
                    setSelectedTerm("");
                    setSelectedWeek("");
                    setCurriculumData([]);
                    setError("");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {error && (
              <div className="error-alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Results Section */}
          {curriculumData.length > 0 && (
            <div className="results-section">
              <div className="results-header">
                <h3>
                  Scheme of Work - {selectedLevel} • {selectedSubject} •{" "}
                  {selectedTerm}
                </h3>
                <span className="results-count">
                  {curriculumData.length} entries
                </span>
              </div>

              <div className="curriculum-grid">
                {curriculumData.map((item, index) => (
                  <div key={item._id || index} className="curriculum-card">
                    <div className="card-week">Week {item.week}</div>

                    <h4 className="card-topic">{item.topic}</h4>

                    {item.content && (
                      <p className="card-content">
                        {item.content.substring(0, 120)}
                        {item.content.length > 120 ? "..." : ""}
                      </p>
                    )}

                    <div className="card-footer">
                      <button
                        className="view-btn"
                        onClick={() => setSelectedScheme(item)}
                      >
                        <FileText size={16} />
                        View Details
                      </button>

                      <button
                        className="generate-btn"
                        onClick={() => handleGenerateLessonNote(item)}
                        disabled={generatingLesson}
                      >
                        {generatingLesson ? (
                          <>
                            <Loader className="spinner-small" size={16} />
                            Generating...
                          </>
                        ) : (
                          <>
                            {isPremium ? (
                              <Zap size={16} />
                            ) : (
                              <Crown size={16} />
                            )}
                            Generate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && curriculumData.length === 0 && !error && (
            <div className="empty-state">
              <BookOpen size={64} />
              <h3>Select Filters to View Curriculum</h3>
              <p>
                Choose your class level, subject, and term from the filters
                above, then click "Load Curriculum" to view the scheme of work.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Scheme Details Modal */}
      {selectedScheme && (
        <div className="modal-overlay" onClick={() => setSelectedScheme(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>
                  Week {selectedScheme.week}: {selectedScheme.topic}
                </h2>
                <p className="modal-subtitle">
                  {selectedScheme.level} • {selectedScheme.subject} •{" "}
                  {selectedScheme.term}
                </p>
              </div>
              <button
                className="modal-close"
                onClick={() => setSelectedScheme(null)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {selectedScheme.content && (
                <div className="detail-section">
                  <h3>📝 Content Summary</h3>
                  <p>{selectedScheme.content}</p>
                </div>
              )}

              {selectedScheme.objectives &&
                selectedScheme.objectives.length > 0 && (
                  <div className="detail-section">
                    <h3>🎯 Learning Objectives</h3>
                    <ul>
                      {selectedScheme.objectives.map((obj, idx) => (
                        <li key={idx}>
                          <CheckCircle size={16} />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {selectedScheme.activities &&
                selectedScheme.activities.length > 0 && (
                  <div className="detail-section">
                    <h3>🎨 Suggested Activities</h3>
                    <ul>
                      {selectedScheme.activities.map((activity, idx) => (
                        <li key={idx}>
                          <CheckCircle size={16} />
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {selectedScheme.teachingAids &&
                selectedScheme.teachingAids.length > 0 && (
                  <div className="detail-section">
                    <h3>📚 Teaching Aids</h3>
                    <div className="aids-grid">
                      {selectedScheme.teachingAids.map((aid, idx) => (
                        <span key={idx} className="aid-badge">
                          {aid}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {selectedScheme.assessment && (
                <div className="detail-section">
                  <h3>✅ Assessment</h3>
                  <p>{selectedScheme.assessment}</p>
                </div>
              )}

              <div className="modal-actions">
                <button
                  className="modal-action-btn primary"
                  onClick={() => handleGenerateLessonNote(selectedScheme)}
                  disabled={generatingLesson}
                >
                  {generatingLesson ? (
                    <>
                      <Loader size={18} />
                      Generating...
                    </>
                  ) : (
                    <>
                      {isPremium ? <Zap size={18} /> : <Crown size={18} />}
                      Lesson Note
                    </>
                  )}
                </button>
                <button
                  className="modal-action-btn secondary"
                  onClick={() => handleGenerateQuestions(selectedScheme)}
                  disabled={generatingQuestions}
                >
                  {generatingQuestions ? (
                    <>
                      <Loader size={18} />
                      Generating...
                    </>
                  ) : (
                    <>
                      {isPremium ? <FileText size={18} /> : <Crown size={18} />}
                      Questions
                    </>
                  )}
                </button>
                <button
                  className="modal-action-btn tertiary"
                  onClick={() => handleExportPDF(selectedScheme)}
                  disabled={exportingPDF}
                >
                  {exportingPDF ? (
                    <>
                      <Loader size={18} />
                      Exporting...
                    </>
                  ) : (
                    <>
                      {isPremium ? <Download size={18} /> : <Crown size={18} />}
                      Export PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Download Confirmation Modal */}
      {showDownloadModal && downloadData && (
        <div
          className="modal-overlay"
          onClick={() => setShowDownloadModal(false)}
        >
          <div className="download-modal" onClick={(e) => e.stopPropagation()}>
            <div className="download-header">
              <CheckCircle size={48} className="success-icon" />
              <h2>Document Generated Successfully!</h2>
            </div>

            <div className="download-body">
              <div className="download-info">
                <h3>{downloadData.type}</h3>
                <p className="download-description">
                  {downloadData.description}
                </p>
                <p className="download-filename">
                  <FileText size={16} />
                  {downloadData.fileName}
                </p>
              </div>

              <div className="download-actions">
                <button
                  className="download-btn primary"
                  onClick={handleDownloadFile}
                >
                  <Download size={20} />
                  Download Now
                </button>

                {downloadData.type === "Lesson Note" && downloadData.scheme && (
                  <button
                    className="download-btn secondary"
                    onClick={handleExportAfterGeneration}
                    disabled={exportingPDF}
                  >
                    {exportingPDF ? (
                      <>
                        <Loader size={20} />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download size={20} />
                        Also Export as PDF
                      </>
                    )}
                  </button>
                )}

                <button
                  className="download-btn tertiary"
                  onClick={() => {
                    setShowDownloadModal(false);
                    setDownloadData(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowUpgradeModal(false)}
            >
              <X size={24} />
            </button>

            <div className="upgrade-content">
              <div className="upgrade-icon">
                <Crown size={48} />
              </div>

              <h2>Upgrade to Premium</h2>
              <p className="upgrade-subtitle">
                Unlock unlimited lesson notes, questions, and exports
              </p>

              <div className="features-list">
                <div className="feature-item">
                  <CheckCircle size={20} />
                  <span>Unlimited 10-12 Page Lesson Notes</span>
                </div>
                <div className="feature-item">
                  <CheckCircle size={20} />
                  <span>Unlimited Assessment Questions</span>
                </div>
                <div className="feature-item">
                  <CheckCircle size={20} />
                  <span>PDF Exports (Single & Full Term)</span>
                </div>
                <div className="feature-item">
                  <CheckCircle size={20} />
                  <span>NERDC-Compliant Documents</span>
                </div>
              </div>

              <div className="pricing-options">
                <div className="pricing-option">
                  <div className="pricing-header">
                    <span className="plan-name">Monthly</span>
                    <div className="plan-price">
                      <span className="currency">₦</span>
                      <span className="amount">1,000</span>
                      <span className="period">/month</span>
                    </div>
                  </div>
                </div>

                <div className="pricing-option recommended">
                  <div className="recommended-badge">Best Value</div>
                  <div className="pricing-header">
                    <span className="plan-name">Yearly</span>
                    <div className="plan-price">
                      <span className="currency">₦</span>
                      <span className="amount">5,000</span>
                      <span className="period">/year</span>
                    </div>
                    <span className="savings">Save ₦7,000!</span>
                  </div>
                </div>
              </div>

              <button
                className="upgrade-now-btn"
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate("/pricing");
                }}
              >
                <Crown size={20} />
                Upgrade Now
              </button>

              <p className="trial-text">✨ Start with a 2-days free trial</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
