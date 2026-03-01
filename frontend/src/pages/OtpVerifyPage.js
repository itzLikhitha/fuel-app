import React, { useState } from "react";
import { verifyOtp } from "../api";

function OtpVerifyPage({ phone, otpPreview, onBack, onLoginSuccess }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await verifyOtp(phone, otp.trim());
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2>OTP Verification</h2>
        <p>Phone: {phone}</p>
        <p className="hint">Simulated OTP (demo): {otpPreview}</p>
        <form onSubmit={submit}>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Login"}
          </button>
        </form>
        <button className="secondary" onClick={onBack}>
          Back
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default OtpVerifyPage;
