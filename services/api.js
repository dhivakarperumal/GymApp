const BASE_URL = "http://192.168.1.16:5000/api";

/* ------------------ HELPER ------------------ */
// lightweight wrapper that mimics axios-style responses; screens currently
// expect `api.post(...).data` so we return that shape.
const api = {
  post: async (path, body) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    // treat non-2xx responses as errors so callers can handle them
    if (!res.ok) {
      const err = new Error(data?.message || "Request failed");
      err.response = { data, status: res.status };
      throw err;
    }

    return { data };
  },

  get: async (path, token = null) => {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers,
    });

    const data = await res.json();

    // treat non-2xx responses as errors so callers can handle them
    if (!res.ok) {
      const err = new Error(data?.message || "Request failed");
      err.response = { data, status: res.status };
      throw err;
    }

    return { data };
  },
  // other methods (put, delete, etc.) can be added later if needed
};

/* ------------------ PRODUCTS ------------------ */
export const getAllProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`);
  return res.json();
};

export const getAllPlans = async () => {
  const res = await fetch(`${BASE_URL}/plans`);
  return res.json();
};

export const getAllServices = async () => {
  const res = await fetch(`${BASE_URL}/services`);
  return res.json();
};

export const getAllFacilities = async () => {
  const res = await fetch(`${BASE_URL}/facilities`);
  return res.json();
};

export const getAllStaffs = async () => {
  const res = await fetch(`${BASE_URL}/staff`);
  return res.json();
};

export const serviceList = async () => {
  try {
    const res = await fetch(`${BASE_URL}/services`);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to fetch services");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.log("SERVICE LIST ERROR 👉", err.message);
    throw err;
  }
};

/* ------------------ AUTH ------------------ */

// ✅ REGISTER (legacy helper returning raw JSON)
export const registerUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return res.json();
};

// ✅ LOGIN (legacy helper returning raw JSON)
export const loginUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return res.json();
};

// ✅ GET PROFILE (Protected Route)
export const getProfile = async (token) => {
  try {
    const response = await api.get("/auth/profile", token);
    return response.data;
  } catch (err) {
    console.log("Get profile error:", err.message);
    throw err;
  }
};

// ✅ GET USER DATA (from /users endpoint)
export const getUser = async (token) => {
  try {
    const response = await api.get("/users", token);
    return response.data;
  } catch (err) {
    console.log("Get user error:", err.message);
    throw err;
  }
};

export default api;

