const RAW_BASE_URL = (process.env.REACT_APP_BASE_URL || "https://fuel-app-be85.onrender.com").trim();
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");
const API_BASE_URL = `${BASE_URL}/api`;

if (!BASE_URL.startsWith("https://")) {
  console.error("[API] REACT_APP_BASE_URL must start with https://. Current value:", BASE_URL);
}

async function request(path, options = {}, token) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;
  console.log("[API] Request URL:", url);
  console.log("[API] Request Body:", options.body || null);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log("[API] Response Status:", response.status);
  const data = await response.json();
  console.log("[API] Response JSON:", data);

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export function requestOtp(phone) {
  return request("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export function verifyOtp(phone, otp) {
  return request("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otp }),
  });
}

export function createBooking(payload, token) {
  return request(
    "/bookings/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );
}

export function getMyBookings(token) {
  return request("/bookings/my", {}, token);
}

export function createMechanicRequest(payload, token) {
  return request(
    "/mechanic/request",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );
}

export function getMyMechanicRequests(token) {
  return request("/mechanic/my", {}, token);
}
