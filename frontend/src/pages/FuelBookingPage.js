import React, { useEffect, useRef, useState } from "react";
import { createBooking, getMyBookings } from "../api";

function FuelBookingPage({ token }) {
  const [fuelType, setFuelType] = useState("Petrol");
  const [quantity, setQuantity] = useState(1);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [vehicleNumberConfirm, setVehicleNumberConfirm] = useState("");
  const [imageData, setImageData] = useState("");
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("Starting camera...");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const loadBookings = async () => {
    try {
      const data = await getMyBookings(token);
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStatus("Camera stopped.");
  };

  const startCamera = async (frontCamera = isFrontCamera) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus("Camera is not supported by this browser.");
      return;
    }

    try {
      stopCamera();
      setCameraStatus("Starting camera...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: frontCamera ? "user" : "environment" },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStatus(frontCamera ? "Front camera active." : "Back camera active.");
      }
    } catch (err) {
      setCameraStatus("Unable to access camera. Please allow camera permissions.");
    }
  };

  const switchCamera = async () => {
    const nextIsFront = !isFrontCamera;
    setIsFrontCamera(nextIsFront);
    await startCamera(nextIsFront);
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !streamRef.current) {
      setError("Camera is not active. Please allow camera access.");
      return;
    }

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL("image/png");
    setImageData(base64Image);
    setCameraStatus("Image captured successfully.");
  };

  useEffect(() => {
    loadBookings();
    startCamera(false);

    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by this browser.");
      return () => {
        stopCamera();
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const coordsText = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;

        setLatitude(lat);
        setLongitude(lng);
        setAddress(coordsText);
        setLocationStatus("Location captured successfully.");
      },
      (geoError) => {
        if (geoError.code === 1) {
          setLocationStatus("Permission denied. Please allow location access.");
        } else if (geoError.code === 2) {
          setLocationStatus("Location unavailable. Please enable GPS/location services.");
        } else if (geoError.code === 3) {
          setLocationStatus("Location request timed out. Please reload and try again.");
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

    return () => {
      stopCamera();
    };
  }, [token]);

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (latitude === null || longitude === null) {
      setError("Location is required. Please allow location permission and reload.");
      return;
    }

    if (!vehicleNumberConfirm.trim()) {
      setError("Please confirm your vehicle number.");
      return;
    }

    if (!imageData) {
      setError("Please capture a vehicle image before booking.");
      return;
    }

    try {
      await createBooking(
        {
          fuelType,
          quantity: Number(quantity),
          address,
          imageData,
          vehicleNumberConfirm: vehicleNumberConfirm.trim(),
        },
        token
      );
      setMessage("Fuel booking submitted successfully.");
      setQuantity(1);
      setImageData("");
      setVehicleNumberConfirm("");
      await loadBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h3>Fuel Booking</h3>

      <p>
        <strong>Latitude:</strong> {latitude !== null ? latitude : "Not available"}
      </p>
      <p>
        <strong>Longitude:</strong> {longitude !== null ? longitude : "Not available"}
      </p>
      {locationStatus && <p>{locationStatus}</p>}

      <form onSubmit={submit} className="stack">
        <label>Fuel Type</label>
        <select value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
          <option>Petrol</option>
          <option>Diesel</option>
          <option>CNG</option>
          <option>EV Charge</option>
        </select>

        <label>Quantity (Liters / Units)</label>
        <input
          type="number"
          min="1"
          step="0.5"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        <label>Detected Delivery Location</label>
        <textarea value={address} readOnly placeholder="Detecting your location..." required />

        <label>Confirm Vehicle Number</label>
        <input
          type="text"
          value={vehicleNumberConfirm}
          onChange={(e) => setVehicleNumberConfirm(e.target.value)}
          placeholder="Enter your registered vehicle number"
          required
        />

        <label>Vehicle Camera Preview</label>
        <video ref={videoRef} autoPlay playsInline className="preview" />
        <canvas ref={canvasRef} className="hidden" />

        <div className="camera-row">
          <button type="button" onClick={captureImage}>
            Capture Image
          </button>
          <button type="button" onClick={switchCamera}>
            Switch Camera (Front / Back)
          </button>
          <button type="button" className="secondary" onClick={stopCamera}>
            Stop Camera
          </button>
        </div>

        {cameraStatus && <p>{cameraStatus}</p>}
        {imageData && <img src={imageData} alt="Captured vehicle" className="preview" />}

        <button type="submit">Book Fuel</button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <h4>Your Bookings</h4>
      <ul className="list">
        {bookings.map((item) => (
          <li key={item.id}>
            {item.fuelType} | {item.quantity} | {item.status} |{" "}
            {new Date(item.createdAt).toLocaleString()}
          </li>
        ))}
        {bookings.length === 0 && <li>No bookings yet.</li>}
      </ul>
    </div>
  );
}

export default FuelBookingPage;
