import React, { useState } from "react";
import LoginPage from "./pages/LoginPage";
import OtpVerifyPage from "./pages/OtpVerifyPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  const [authStep, setAuthStep] = useState("login");
  const [phone, setPhone] = useState("");
  const [otpPreview, setOtpPreview] = useState("");
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);

  const handleOtpRequested = (submittedPhone, otp) => {
    setPhone(submittedPhone);
    setOtpPreview(otp);
    setAuthStep("verify");
  };

  const handleLoginSuccess = (authToken, loggedInUser) => {
    setToken(authToken);
    setUser(loggedInUser);
    setAuthStep("dashboard");
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    setPhone("");
    setOtpPreview("");
    setAuthStep("login");
  };

  if (authStep === "login") {
    return <LoginPage onOtpRequested={handleOtpRequested} />;
  }

  if (authStep === "verify") {
    return (
      <OtpVerifyPage
        phone={phone}
        otpPreview={otpPreview}
        onBack={() => setAuthStep("login")}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return <DashboardPage token={token} user={user} onLogout={handleLogout} />;
}

export default App;
