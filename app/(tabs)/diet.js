import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../PrivateRouter/AuthContext";

const DietChart = () => {
  const { user } = useAuth();

  const [diet, setDiet] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDietPlan = async () => {
    try {
      const res = await api.get("/diet-plans");

      const data = res.data;

      if (!Array.isArray(data)) return;

      const myDiet = data.find(
        (item) => item.user_id === user.id
      );

      if (myDiet) {
        setTitle(myDiet.title);
        setDiet(myDiet.days);
      }
    } catch (err) {
      console.error("Diet fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDietPlan();
    }
  }, [user]);

  if (loading) {
    return <p className="text-gray-400">Loading diet plan...</p>;
  }

  return (
    <div className="space-y-8">

      <h2 className="text-2xl font-bold text-red-500">
        My Diet Plan
      </h2>

      {title && (
        <p className="text-gray-400">{title}</p>
      )}

      {diet &&
        Object.entries(diet).map(([day, meals]) => (
          <div
            key={day}
            className="bg-gray-900 rounded-xl p-6 border border-red-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">
                {day} Meals
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(meals).map(([meal, value]) => (
                <div
                  key={meal}
                  className="bg-black rounded-lg p-4 border border-gray-800"
                >
                  <p className="text-red-400 text-sm font-semibold mb-1">
                    {meal}
                  </p>

                  <p className="text-gray-300 text-sm">
                    {value.food} ({value.quantity})
                  </p>

                  <p className="text-gray-500 text-xs">
                    {value.calories} calories
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

      {!diet && (
        <div className="text-center py-20">

          <div className="text-6xl text-red-500 mb-6">
            🍽️
          </div>

          <h3 className="text-white text-lg font-semibold mb-2">
            No Diet Plan Assigned
          </h3>

          <p className="text-gray-400 mb-6">
            Purchase a premium plan to unlock your personalized diet chart
          </p>

          <button
            onClick={() => (window.location.href = "/pricing")}
            className="bg-red-500 px-6 py-3 rounded-lg text-white font-semibold"
          >
            View Pricing Plans
          </button>
        </div>
      )}

    </div>
  );
};

export default DietChart;