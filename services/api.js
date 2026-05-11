const BASE_URL = "https://dap.qtechx.com/api";

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

  put: async (path, body) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data?.message || "Request failed");
      err.response = { data, status: res.status };
      throw err;
    }

    return { data };
  },

  delete: async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data?.message || "Request failed");
      err.response = { data, status: res.status };
      throw err;
    }

    return { data };
  }
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

// SET PASSWORD
export const setPasswordApi = async ({ userId, oldPassword, newPassword }) => {
  const res = await fetch(`${BASE_URL}/auth/set-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, oldPassword, newPassword }),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body?.message || "Failed to update password");
  }

  return body;
};

/* ------------------ ASSIGNMENTS ------------------ */

/* ------------------ TRAINER MEMBERS ------------------ */

export const getTrainerMembers = async (trainerId, user) => {
  try {
    /* Use server-side filter — same as dashboard */
    const res = await api.get(`/assignments?trainerUserId=${trainerId}`);

    const raw = res.data || [];

    const assignments = Array.isArray(raw)
      ? raw
      : raw.data || raw.assignments || [];

    /* Show active OR status-less members (same logic as web + dashboard) */
    const activeAssignments = assignments.filter(
      (a) => !a.status || (a.status || "").toLowerCase() === "active"
    );

    /* Deduplicate by userId */
    const seen = new Set();
    const unique = [];
    for (const a of activeAssignments) {
      const uid = String(a.userId || a.user_id || "");
      if (uid && !seen.has(uid)) {
        seen.add(uid);
        unique.push(a);
      }
    }

    return unique.map((a) => ({
      id: String(a.userId || a.user_id),
      name: a.username || a.user_name || "Member",
      email: a.userEmail || a.user_email || "",
      mobile: a.userMobile || a.user_mobile || "",
      weight: a.userWeight || a.member_weight || a.weight || "",
      planName: a.planName || a.plan_name || "",
    }));
  } catch (err) {
    console.log("Get trainer members error:", err);
    throw err;
  }
};


// Trainer assigned to user
export const getUserAssignment = async () => {
  const res = await fetch(`${BASE_URL}/assignments`);
  return res.json();
};

// get all diet plans (supports filtering by memberId, email, mobile, trainerId)
export const getDietPlans = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/diet-plans${query ? `?${query}` : ""}`;
  const res = await fetch(url);
  return res.json();
};

// get all workouts (supports filtering by memberId, email, mobile, trainerId)
export const getTrainerWorkouts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/workouts${query ? `?${query}` : ""}`;
  const res = await fetch(url);
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

/* ------------------ TRAINER DASHBOARD ------------------ */

export const getTrainerDashboard = async (trainerId, user) => {
  try {
    /* ---------------- ASSIGNMENTS (server-side filter) ---------------- */

    const assignmentRes = await api.get(
      `/assignments?trainerUserId=${trainerId}`
    );

    const rawAssignments = assignmentRes.data || [];

    const membersRaw = Array.isArray(rawAssignments)
      ? rawAssignments
      : rawAssignments.data || rawAssignments.assignments || [];

    console.log("📊 Assignments from server:", membersRaw.length);

    /* Show active OR status-less members (same logic as web dashboard) */
    const activeMembers = membersRaw.filter(
      (m) => !m.status || (m.status || "").toLowerCase() === "active"
    );

    /* Remove duplicates by userId */
    const uniqueMembers = Array.from(
      new Map(
        activeMembers.map((m) => [m.userId || m.user_id, m])
      ).values()
    );

    const assignedMemberIds = uniqueMembers.map((m) =>
      String(m.userId || m.user_id)
    );

    console.log("👥 Assigned members:", assignedMemberIds.length);

    /* ---------------- WORKOUT PLANS ---------------- */

    let workoutCount = 0;

    try {
      const workoutRes = await api.get("/workouts");
      const workoutRaw = workoutRes.data || [];
      const workouts = Array.isArray(workoutRaw)
        ? workoutRaw
        : workoutRaw.data || [];
      const userWorkouts = assignedMemberIds.length > 0
        ? workouts.filter((w) =>
            assignedMemberIds.includes(String(w.member_id || w.memberId))
          )
        : workouts;
      workoutCount = userWorkouts.length;
      console.log("💪 Workouts:", workoutCount);
    } catch (err) {
      console.log("Workout fetch error:", err);
    }

    /* ---------------- DIET PLANS ---------------- */

    let dietCount = 0;

    try {
      const dietRes = await api.get("/diet-plans");
      const dietRaw = dietRes.data || [];
      const diets = Array.isArray(dietRaw) ? dietRaw : dietRaw.data || [];
      const userDiets = assignedMemberIds.length > 0
        ? diets.filter((d) =>
            assignedMemberIds.includes(String(d.member_id || d.memberId))
          )
        : diets;
      dietCount = userDiets.length;
      console.log("🥗 Diets:", dietCount);
    } catch (err) {
      console.log("Diet fetch error:", err);
    }

    /* ---------------- CHECKINS ---------------- */

    let checkins = 0;

    try {
      const checkinRes = await api.get(
        `/checkins/today?trainerId=${trainerId}`
      );
      checkins =
        checkinRes.data?.count ||
        checkinRes.data?.length ||
        0;
      console.log("📅 Checkins:", checkins);
    } catch (err) {
      console.log("Checkin fetch error:", err);
    }

    /* ---------------- RETURN ---------------- */

    return {
      members: uniqueMembers,
      stats: {
        members: uniqueMembers.length,
        todayCheckins: checkins,
        workoutPlans: workoutCount,
        dietPlans: dietCount,
      },
    };
  } catch (err) {
    console.log("Dashboard API error:", err);
    throw err;
  }
};

// GET DIET PLANS BY TRAINER
export const getTrainerDietPlans = async (trainerId) => {
  try {
    const res = await fetch(`${BASE_URL}/diet-plans?trainerId=${trainerId}`);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to fetch diet plans");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.log("GET TRAINER DIET ERROR 👉", err.message);
    throw err;
  }
};

/* ---------------- SINGLE DIET PLAN ---------------- */

export const getDietPlan = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/diet-plans/${id}`);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to fetch diet plan");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.log("GET DIET PLAN ERROR 👉", err.message);
    throw err;
  }
};

/* ---------------- DELETE DIET PLAN ---------------- */

export const deleteDietPlanApi = async (id) => {
  const res = await fetch(`${BASE_URL}/diet-plans/${id}`, {
    method: "DELETE",
  });

  return res.json();
};

/* ---------------- WORKOUTS ---------------- */

// GET ASSIGNED MEMBERS
export const getAssignments = async () => {
  const res = await fetch(`${BASE_URL}/assignments`);
  return res.json();
};

// GET SINGLE WORKOUT
export const getWorkout = async (id) => {
  const res = await fetch(`${BASE_URL}/workouts/${id}`);
  return res.json();
};

// CREATE WORKOUT
export const createWorkout = async (data) => {
  const res = await fetch(`${BASE_URL}/workouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

// UPDATE WORKOUT
export const updateWorkout = async (id, data) => {
  const res = await fetch(`${BASE_URL}/workouts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};


// GET USER MEMBERSHIPS
export const getUserMemberships = async (userId) => {
  try {
    const res = await fetch(`${BASE_URL}/memberships?userId=${userId}`);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to fetch memberships");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.log("GET USER MEMBERSHIPS ERROR 👉", err.message);
    throw err;
  }
};

/* ---------------- FOLLOW UP ENQUIRY ---------------- */

export const getFollowups = async () => {
  const res = await fetch(`${BASE_URL}/followups`);
  return res.json();
};

export const createFollowup = async (data) => {
  const res = await fetch(`${BASE_URL}/followups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateFollowup = async (id, data) => {
  const res = await fetch(`${BASE_URL}/followups/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getFollowupInteractions = async (id) => {
  const res = await fetch(`${BASE_URL}/followups/${id}/interactions`);
  return res.json();
};

export const createFollowupInteraction = async (data) => {
  const res = await fetch(`${BASE_URL}/followups/interactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getPlans = async () => {
  const res = await fetch(`${BASE_URL}/plans`);
  return res.json();
};

export const getStaff = async () => {
  const res = await fetch(`${BASE_URL}/staff`);
  return res.json();
};

export const getOffers = async () => {
  const res = await fetch(`${BASE_URL}/offers`);
  return res.json();
};

export default api;

