import React, { useState } from "react";

function LoginPage({ onOtpRequested }) {
  const [phone, setPhone] = useState("");

  const sendOtp = () => {
    if (!phone) {
      alert("Enter phone number");
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    localStorage.setItem("demo_otp", otp);
    localStorage.setItem("phone", phone);

    alert("OTP sent: " + otp);
    onOtpRequested(phone, otp);
  };

  return (
    <div className="page">
      <div className="card">
        <h1>Online Fuel Delivery</h1>
        <p>Enter your 10-digit mobile number to receive OTP.</p>
        <input
          type="tel"
          placeholder="10-digit phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={10}
          required
        />
        <button type="button" onClick={sendOtp}>
          Send OTP
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
