import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Background Image */}
      <div className="homepage-background"></div>

      {/* Navigation */}
      <nav className="homepage-nav">
        <div className="nav-container">
          <div className="logo">
            <BookOpen className="logo-icon" size={28} />
            <h2>Curriculum Box</h2>
          </div>
          <div className="nav-links">
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/signup" className="nav-btn">
              Sign Up
              <ArrowRight size={18} className="nav-btn-icon" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Ready to Transform Your Teaching?</h1>
          <p className="hero-subtitle">
            Join thousands of educators already using Curriculum Box
          </p>
          <Link to="/signup" className="cta-primary">
            Get Started Free
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <p>© 2026 Curriculum Box • NERDC-Compliant</p>
      </footer>
    </div>
  );
};

export default HomePage;
