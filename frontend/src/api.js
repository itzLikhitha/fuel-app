const BASE_URL = "https://fuel-app-6kiv.onrender.com";

async function request(path, options = {}, token) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/api${path}`, {
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
