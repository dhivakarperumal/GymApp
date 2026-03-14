const BASE_URL = "https://mygym.qtechx.com/api";

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

/* ------------------ TRAINER MEMBERS ------------------ */

export const getTrainerMembers = async (trainerId, user) => {
  try {
    const res = await api.get("/assignments");

    const raw = res.data || [];

    const assignments = Array.isArray(raw)
      ? raw
      : raw.data || raw.assignments || [];

    const filtered = assignments
      .filter((a) => {
        let include = false;

        const assignTrainerId = Number(a.trainerId || a.trainer_id);

        if (!isNaN(assignTrainerId) && assignTrainerId === Number(trainerId)) {
          include = true;
        }

        if (!include && user?.username && (a.trainerName || a.trainer_name)) {
          if (
            (a.trainerName || a.trainer_name).toLowerCase() ===
            user.username.toLowerCase()
          ) {
            include = true;
          }
        }

        return include;
      })
      .map((a) => ({
        id: String(a.userId || a.user_id),
        name: a.username || a.user_name || "Member",
        email: a.userEmail || a.user_email || "",
        mobile: a.userMobile || a.user_mobile || "",
        planName: a.planName || a.plan_name || "",
      }));

    return filtered;
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

/* ------------------ TRAINER DASHBOARD ------------------ */

export const getTrainerDashboard = async (trainerId, user) => {
  try {
    /* ---------------- ASSIGNMENTS ---------------- */

    const assignmentRes = await api.get("/assignments");

    const rawAssignments = assignmentRes.data || [];

    const assignments = Array.isArray(rawAssignments)
      ? rawAssignments
      : rawAssignments.data || rawAssignments.assignments || [];

    /* Match trainer like Web Dashboard */

    const filteredByTrainer = assignments.filter((a) => {
      let include = false;

      const assignTrainerId = Number(a.trainerId || a.trainer_id);

      if (!isNaN(assignTrainerId) && assignTrainerId === Number(trainerId)) {
        include = true;
      }

      if (!include && user?.username && (a.trainerName || a.trainer_name)) {
        if (
          (a.trainerName || a.trainer_name).toLowerCase() ===
          user.username.toLowerCase()
        ) {
          include = true;
        }
      }

      if (!include && user?.email && (a.trainerEmail || a.trainer_email)) {
        if (
          (a.trainerEmail || a.trainer_email).toLowerCase() ===
          user.email.toLowerCase()
        ) {
          include = true;
        }
      }

      return include;
    });

    /* ACTIVE MEMBERS */

    const activeMembers = filteredByTrainer.filter(
      (m) => (m.status || "").toLowerCase() === "active"
    );

    /* REMOVE DUPLICATES */

    const uniqueMembers = Array.from(
      new Map(
        activeMembers.map((m) => [m.userId || m.user_id, m])
      ).values()
    );

    const memberIds = uniqueMembers.map((m) =>
      String(m.userId || m.user_id)
    );

    /* ---------------- WORKOUT PLANS ---------------- */

    let workoutCount = 0;

    try {
      const workoutRes = await api.get("/workouts");

      const workoutRaw = workoutRes.data || [];

      const workouts = Array.isArray(workoutRaw)
        ? workoutRaw
        : workoutRaw.data || [];

      const userWorkouts = workouts.filter((w) =>
        memberIds.includes(String(w.member_id || w.memberId))
      );

      workoutCount = userWorkouts.length;
    } catch (err) {
      console.log("Workout fetch error:", err);
    }

    /* ---------------- DIET PLANS ---------------- */

    let dietCount = 0;

    try {
      const dietRes = await api.get("/diet-plans");

      const dietRaw = dietRes.data || [];

      const diets = Array.isArray(dietRaw)
        ? dietRaw
        : dietRaw.data || [];

      const userDiets = diets.filter((d) =>
        memberIds.includes(String(d.member_id || d.memberId))
      );

      dietCount = userDiets.length;
    } catch (err) {
      console.log("Diet fetch error:", err);
    }

    /* ---------------- CHECKINS ---------------- */

    let checkins = 0;

    try {
      const checkinRes = await api.get(
        `/checkins/today?trainerId=${trainerId}`
      );

      const checkinData = checkinRes.data;

      checkins =
        checkinData?.count ||
        checkinData?.length ||
        0;
    } catch (err) {
      console.log("Checkin fetch error:", err);
    }

    /* ---------------- RETURN DASHBOARD DATA ---------------- */

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

export default api;

