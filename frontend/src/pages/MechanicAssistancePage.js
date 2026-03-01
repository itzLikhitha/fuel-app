import React, { useEffect, useState } from "react";
import { createMechanicRequest, getMyMechanicRequests } from "../api";

const ISSUE_OPTIONS = [
  "Flat Tire",
  "Engine Problem",
  "Battery Issue",
  "Brake Failure",
  "Fuel Leakage",
];

function MechanicAssistancePage({ token }) {
  const [vehicleType, setVehicleType] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");

  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRequests = async () => {
    try {
      const data = await getMyMechanicRequests(token);
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by this browser.");
      return;
    }

    setLocationStatus("Detecting your live location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);
        setLocation(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
        setLocationStatus("Location detected.");
      },
      (geoError) => {
        if (geoError.code === 1) {
          setLocationStatus("Permission denied. Please allow location access.");
        } else if (geoError.code === 2) {
          setLocationStatus("Location unavailable. Enable location services and try again.");
        } else if (geoError.code === 3) {
          setLocationStatus("Location request timed out. Try again.");
        } else {
          setLocationStatus("Unable to fetch location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    loadRequests();
    fetchLiveLocation();
  }, [token]);

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!location) {
      setError("Live location is required. Please allow location access.");
      return;
    }

    try {
      await createMechanicRequest(
        {
          vehicleType,
          issueDescription,
          location,
        },
        token
      );
      setMessage("Mechanic request submitted.");
      setVehicleType("");
      setIssueDescription("");
      await loadRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h3>Mechanic Assistance</h3>
      <form onSubmit={submit} className="stack">
        <label>Vehicle Type</label>
        <input
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          placeholder="Bike / Car / Truck"
          required
        />

        <label>Issue</label>
        <select
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
          required
        >
          <option value="" disabled>
            Select issue
          </option>
          {ISSUE_OPTIONS.map((issue) => (
            <option key={issue} value={issue}>
              {issue}
            </option>
          ))}
        </select>

        <p>
          <strong>Detected Coordinates:</strong>{" "}
          {latitude !== null && longitude !== null
            ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            : "Not available"}
        </p>
        {locationStatus && <p>{locationStatus}</p>}

        <button type="submit">Request Mechanic</button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <h4>Your Mechanic Requests</h4>
      <ul className="list">
        {requests.map((item) => (
          <li key={item.id}>
            {item.vehicleType} | {item.status} | {new Date(item.createdAt).toLocaleString()}
          </li>
        ))}
        {requests.length === 0 && <li>No mechanic requests yet.</li>}
      </ul>
    </div>
  );
}

export default MechanicAssistancePage;
