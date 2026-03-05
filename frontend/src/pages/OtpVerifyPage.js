import React, { useState } from "react";

function OtpVerifyPage({ phone, otpPreview, onBack, onLoginSuccess }) {
  const [otp, setOtp] = useState("");

  const verifyOtp = () => {
    const savedOtp = localStorage.getItem("demo_otp");

    if (otp === savedOtp) {
      alert("Login successful");
      const savedPhone = localStorage.getItem("phone") || phone;
      onLoginSuccess("demo-token", { id: "demo-user", phone: savedPhone });
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2>OTP Verification</h2>
        <p>Phone: {phone}</p>
        <p className="hint">Simulated OTP (demo): {otpPreview}</p>
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          required
        />
        <button type="button" onClick={verifyOtp}>
          Verify & Login
        </button>
        <button className="secondary" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

export default OtpVerifyPage;
