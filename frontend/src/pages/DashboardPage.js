import React, { useState } from "react";
import FuelBookingPage from "./FuelBookingPage";
import MechanicAssistancePage from "./MechanicAssistancePage";

function DashboardPage({ token, user, onLogout }) {
  const [activeTab, setActiveTab] = useState("booking");

  return (
    <div className="page">
      <div className="card wide">
        <div className="header-row">
          <div>
            <h2>Welcome</h2>
            <p>Logged in as {user?.phone}</p>
          </div>
          <button className="secondary" onClick={onLogout}>
            Logout
          </button>
        </div>

        <div className="tabs">
          <button
            className={activeTab === "booking" ? "tab active" : "tab"}
            onClick={() => setActiveTab("booking")}
          >
            Fuel Booking
          </button>
          <button
            className={activeTab === "mechanic" ? "tab active" : "tab"}
            onClick={() => setActiveTab("mechanic")}
          >
            Mechanic Assistance
          </button>
        </div>

        {activeTab === "booking" ? (
          <FuelBookingPage token={token} />
        ) : (
          <MechanicAssistancePage token={token} />
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
