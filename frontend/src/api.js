const BASE_URL = "https://fuel-app-be85.onrender.com";
const API_BASE_URL = `${BASE_URL}/api`;

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

  console.log("Request URL:", url);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

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
