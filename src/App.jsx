import HomePage from "./HomePage";
import Dashboard from "./Dashboard";
import LoginSignup from "./LoginSignup";
import Pricing from "./components/Pricing";
import PaymentCallback from "./components/PaymentCallback";
import ReferralDashboard from "./components/ReferralDashboard";
import EmailVerification from "./components/EmailVerification";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/signup" element={<LoginSignup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/referral" element={<ReferralDashboard />} />
          <Route path="/verify-email" element={<EmailVerification />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
