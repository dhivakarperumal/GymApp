const BASE_URL = "http://192.168.1.4:5000/api";

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

export const getAllReviews = async () => {
  const res = await fetch(`${BASE_URL}/reviews`);
  return res.json();
};

// Cart Page Logic
// GET CART
export const getCart = async (userId) => {
  const res = await fetch(`${BASE_URL}/cart?userId=${userId}`);
  return res.json();
};

// ADD CART
export const addToCartApi = async (data) => {
  const res = await fetch(`${BASE_URL}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const text = await res.text();
  console.log("ADD CART RESPONSE 👉", text);

  return JSON.parse(text);
};

// UPDATE CART
export const updateCartApi = async (id, quantity) => {
  const res = await fetch(`${BASE_URL}/cart/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
  });

  return res.json();
};

// DELETE CART ITEM
export const deleteCartApi = async (id) => {
  const res = await fetch(`${BASE_URL}/cart/${id}`, {
    method: "DELETE",
  });

  return res.json();
};

// clear user cart (after order placed)
export const clearUserCart = async (userId) => {
  const res = await fetch(`${BASE_URL}/cart/user/${userId}`, {
    method: "DELETE",
  });

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

// UPDATE USER
export const updateUserApi = async (id, data) => {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

/* ------------------ ASSIGNMENTS ------------------ */

// Trainer assigned to user
export const getUserAssignment = async () => {
  const res = await fetch(`${BASE_URL}/assignments`);
  return res.json();
};

// get all diet plans
export const getDietPlans = async () => {
  const res = await fetch(`${BASE_URL}/diet-plans`);
  return res.json();
};

// get all workouts
export const getTrainerWorkouts = async () => {
  const res = await fetch(`${BASE_URL}/workouts`);
  return res.json();
};

/* ------------------ ORDERS ------------------ */

// GET SINGLE PRODUCT (needed for stock check)
export const getProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  return res.json();
};

// UPDATE PRODUCT STOCK
export const updateProductStock = async (id, stock) => {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ stock }),
  });

  return res.json();
};

// GENERATE ORDER ID
export const generateOrderId = async () => {
  const res = await fetch(`${BASE_URL}/orders/generate-order-id`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res.json();
};

// CREATE ORDER
export const createOrderApi = async (orderData) => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  return res.json();
};

export const getUserOrders = async (userId) => {
  const res = await fetch(`${BASE_URL}/orders?userId=${userId}`);
  return res.json();
};



export default api;

