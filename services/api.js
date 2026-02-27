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
  // other methods (get, put, etc.) can be added later if needed
};

/* ------------------ PRODUCTS ------------------ */
export const getAllProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`);
  return res.json();
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
  const res = await fetch(`${BASE_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

export default api;

