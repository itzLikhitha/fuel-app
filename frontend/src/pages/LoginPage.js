import React, { useState } from "react";
import { requestOtp } from "../api";

function LoginPage({ onOtpRequested }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await requestOtp(phone.trim());
      onOtpRequested(phone.trim(), data.otp);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>Online Fuel Delivery</h1>
        <p>Enter your 10-digit mobile number to receive OTP.</p>
        <form onSubmit={submit}>
          <input
            type="tel"
            placeholder="10-digit phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={10}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
