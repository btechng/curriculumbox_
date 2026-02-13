import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { PaystackButton } from "react-paystack";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TeacherDashboard = () => {
  const { user, token } = useAuth();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [schemeOfWork, setSchemeOfWork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasPaid, setHasPaid] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Your Paystack public key
  const paystackPublicKey = "pk_test_YOUR_PUBLIC_KEY_HERE"; // Replace with your actual key

  const classes = [
    "Primary 1",
    "Primary 2",
    "Primary 3",
    "Primary 4",
    "Primary 5",
    "Primary 6",
    "JSS 1",
    "JSS 2",
    "JSS 3",
    "SS 1",
    "SS 2",
    "SS 3",
  ];

  const terms = ["First Term", "Second Term", "Third Term"];

  // Fetch subjects when class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchSubjects();
    }
  }, [selectedClass]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/curriculum/subjects?level=${selectedClass}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setSubjects(data.subjects);
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  // Fetch scheme of work when all fields are selected
  const fetchSchemeOfWork = async () => {
    if (!selectedClass || !selectedTerm || !selectedWeek || !selectedSubject) {
      setError("Please select class, subject, term, and week");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/curriculum/scheme?level=${selectedClass}&subject=${selectedSubject}&term=${selectedTerm}&week=${selectedWeek}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setSchemeOfWork(data.data);
      } else {
        setError(data.error || "Scheme of work not found");
      }
    } catch (err) {
      setError("Error fetching scheme of work");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle the generate lesson note button click
  const handleGenerateLessonNote = () => {
    // First fetch the scheme of work
    fetchSchemeOfWork();

    // Show payment modal after scheme is loaded
    setShowPayment(true);
  };

  // Paystack configuration
  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: user?.email,
    amount: 100000, // ₦1000 in kobo (1000 * 100)
    publicKey: paystackPublicKey,
    metadata: {
      custom_fields: [
        {
          display_name: "Teacher Name",
          variable_name: "teacher_name",
          value: user?.name,
        },
        {
          display_name: "Class",
          variable_name: "class",
          value: selectedClass,
        },
        {
          display_name: "Subject",
          variable_name: "subject",
          value: selectedSubject,
        },
      ],
    },
  };

  // Handle payment success
  const handlePaystackSuccess = async (reference) => {
    console.log("Payment successful:", reference);

    // Verify payment on backend
    try {
      const response = await fetch(`${API_BASE_URL}/payments/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reference: reference.reference }),
      });

      const data = await response.json();

      if (data.success) {
        setHasPaid(true);
        setShowPayment(false);
        // Generate the lesson note now
        generateLessonNote();
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
      setError("Payment verification failed");
    }
  };

  // Handle payment close
  const handlePaystackClose = () => {
    setShowPayment(false);
    alert("Payment cancelled");
  };

  // Generate lesson note after payment
  const generateLessonNote = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/lessons/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          level: selectedClass,
          subject: selectedSubject,
          term: selectedTerm,
          week: selectedWeek,
          schemeOfWork: schemeOfWork,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Lesson note generated successfully!");
        // You can redirect or show the lesson note
        window.location.href = `/lesson-notes/${data.lessonNoteId}`;
      }
    } catch (err) {
      console.error("Error generating lesson note:", err);
      setError("Failed to generate lesson note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-dashboard">
      <h1>Teacher Dashboard</h1>
      <p>Welcome, {user?.name}</p>

      <div className="lesson-generator">
        <h2>Generate Lesson Note</h2>

        <div className="form-group">
          <label>Select Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Select Class --</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Select Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!selectedClass}
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Select Term:</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            <option value="">-- Select Term --</option>
            {terms.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Select Week:</label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          >
            <option value="">-- Select Week --</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => (
              <option key={week} value={week}>
                Week {week}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleGenerateLessonNote}
          disabled={
            !selectedClass ||
            !selectedTerm ||
            !selectedWeek ||
            !selectedSubject ||
            loading
          }
          className="generate-btn"
        >
          {loading ? "Loading..." : "Generate Lesson Note"}
        </button>

        {/* Scheme of Work Display */}
        {schemeOfWork && (
          <div className="scheme-display">
            <h3>Scheme of Work Summary</h3>
            <p>
              <strong>Topic:</strong> {schemeOfWork.topic}
            </p>
            <p>
              <strong>Sub-topics:</strong>
            </p>
            <ul>
              {schemeOfWork.subTopics?.map((subTopic, idx) => (
                <li key={idx}>{subTopic}</li>
              ))}
            </ul>
            <p>
              <strong>Objectives:</strong>
            </p>
            <ul>
              {schemeOfWork.objectives?.map((obj, idx) => (
                <li key={idx}>{obj}</li>
              ))}
            </ul>
            <p>
              <strong>Content:</strong> {schemeOfWork.content}
            </p>
          </div>
        )}

        {/* Payment Modal */}
        {showPayment && schemeOfWork && (
          <div className="payment-modal">
            <div className="modal-content">
              <h3>Payment Required</h3>
              <p>To generate this lesson note, please pay ₦1,000</p>

              <PaystackButton
                {...paystackConfig}
                text="Pay ₦1,000 with Paystack"
                onSuccess={handlePaystackSuccess}
                onClose={handlePaystackClose}
                className="paystack-button"
              />

              <button onClick={() => setShowPayment(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .teacher-dashboard {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .lesson-generator {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-top: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }

        .generate-btn {
          background: #4caf50;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
        }

        .generate-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }

        .scheme-display {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 4px;
          margin-top: 20px;
        }

        .scheme-display h3 {
          margin-top: 0;
        }

        .payment-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 8px;
          max-width: 400px;
          width: 90%;
        }

        .paystack-button {
          background: #00c3f7;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
          margin: 10px 0;
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;
