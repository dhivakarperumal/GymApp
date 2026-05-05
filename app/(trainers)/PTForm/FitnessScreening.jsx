import { useCallback, useEffect, useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Radio component moved outside to prevent recreation on every render
const RadioButton = ({ label, value, isSelected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{ flexDirection: "row", alignItems: "center", marginRight: 12, marginVertical: 4 }}
  >
    <View
      style={{
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: isSelected ? "#f97316" : "#aaa",
        backgroundColor: isSelected ? "#f97316" : "transparent",
        marginRight: 6,
      }}
    />
    <Text style={{ color: "white" }}>{label}</Text>
  </TouchableOpacity>
);

const FitnessScreening = ({ onNext, onPrevious, initialData = {} }) => {
  const [form, setForm] = useState({
    height: "",
    weight: "",
    resting_hr: "",

    fat_percentage: "",
    fat_level: "",

    speed_km: "",
    heart_rate: "",

    push_ups_count: "",
    push_ups_level: "",

    squats_count: "",
    squats_level: "",

    plank_hold_count: "",
    plank_hold_level: "",

    shoulder_count: "",
    shoulder_level: "",

    biceps_count: "",
    biceps_level: "",

    triceps_count: "",
    triceps_level: "",

    curl_ups_count: "",
    curl_ups_level: "",
  });

  const [manualFat, setManualFat] = useState(false);

  // Initialize form with data from initialData
  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      const mappedData = {};
      for (const key in initialData) {
        if (key.startsWith('fs_')) {
          const newKey = key.slice(3); // remove 'fs_'
          mappedData[newKey] = initialData[key];
        } else if (!key.startsWith('fs_') && form.hasOwnProperty(key)) {
          mappedData[key] = initialData[key];
        }
      }
      setForm(prev => ({ ...prev, ...mappedData }));
    }
  }, [initialData]);

  const handleChange = useCallback((name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  // ✅ AUTO FAT LEVEL LOGIC
  useEffect(() => {
    if (manualFat) return;

    const fat = parseFloat(form.fat_percentage);
    if (isNaN(fat) || fat === "") return;

    const gender = initialData?.gender || "Male";
    let level = "";

    if (gender === "Male") {
      if (fat < 8) level = "Low";
      else if (fat <= 19) level = "Healthy";
      else if (fat <= 25) level = "Overweight";
      else level = "Obese";
    } else {
      if (fat < 21) level = "Low";
      else if (fat <= 33) level = "Healthy";
      else if (fat <= 39) level = "Overweight";
      else level = "Obese";
    }

    if (form.fat_level !== level && level !== "") {
      setForm(prev => ({ ...prev, fat_level: level }));
    }
  }, [form.fat_percentage, initialData?.gender, form.fat_level, manualFat]);

  const handleRadioPress = useCallback((name, value) => {
    if (name === "fat_level") setManualFat(true);
    handleChange(name, value);
  }, [handleChange]);

  const MuscleRow = useCallback((label, prefix) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: "#ccc", marginBottom: 6, fontWeight: "500" }}>{label}</Text>

      <TextInput
        placeholder="Count"
        placeholderTextColor="#777"
        value={form[`${prefix}_count`]}
        onChangeText={(t) => handleChange(`${prefix}_count`, t)}
        style={input}
        keyboardType="numeric"
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
        <RadioButton 
          label="Superior" 
          value="Superior" 
          isSelected={form[`${prefix}_level`] === "Superior"}
          onPress={() => handleRadioPress(`${prefix}_level`, "Superior")}
        />
        <RadioButton 
          label="Good" 
          value="Good" 
          isSelected={form[`${prefix}_level`] === "Good"}
          onPress={() => handleRadioPress(`${prefix}_level`, "Good")}
        />
        <RadioButton 
          label="Poor" 
          value="Poor" 
          isSelected={form[`${prefix}_level`] === "Poor"}
          onPress={() => handleRadioPress(`${prefix}_level`, "Poor")}
        />
      </View>
    </View>
  ), [form, handleChange, handleRadioPress]);

  const handleNextPress = useCallback(() => {
    const normalizedForm = {
      ...form,
      fs_height: form.height,
      fs_weight: form.weight,
      fs_resting_hr: form.resting_hr,
      fs_fat_percentage: form.fat_percentage,
      fs_fat_level: form.fat_level,
      fs_speed_km: form.speed_km,
      fs_heart_rate: form.heart_rate,
      fs_push_ups_count: form.push_ups_count,
      fs_push_ups_level: form.push_ups_level,
      fs_squats_count: form.squats_count,
      fs_squats_level: form.squats_level,
      fs_plank_hold_count: form.plank_hold_count,
      fs_plank_hold_level: form.plank_hold_level,
      fs_shoulder_count: form.shoulder_count,
      fs_shoulder_level: form.shoulder_level,
      fs_biceps_count: form.biceps_count,
      fs_biceps_level: form.biceps_level,
      fs_triceps_count: form.triceps_count,
      fs_triceps_level: form.triceps_level,
      fs_curl_ups_count: form.curl_ups_count,
      fs_curl_ups_level: form.curl_ups_level,
    };
    onNext(normalizedForm);
  }, [onNext, form]);

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <View style={{ paddingVertical: 16 }}>

        {/* RESTING */}
        <Text style={title}>Resting Parameters</Text>

        <TextInput
          placeholder="Height (cm)"
          placeholderTextColor="#777"
          value={form.height}
          onChangeText={(t) => handleChange("height", t)}
          style={input}
          keyboardType="numeric"
        />

        <TextInput
          placeholder="Weight (kg)"
          placeholderTextColor="#777"
          value={form.weight}
          onChangeText={(t) => handleChange("weight", t)}
          style={input}
          keyboardType="numeric"
        />

        <TextInput
          placeholder="Resting HR (bpm)"
          placeholderTextColor="#777"
          value={form.resting_hr}
          onChangeText={(t) => handleChange("resting_hr", t)}
          style={input}
          keyboardType="numeric"
        />

        {/* FAT */}
        <Text style={title}>Fat %</Text>

        <TextInput
          placeholder="Fat %"
          placeholderTextColor="#777"
          value={form.fat_percentage}
          onChangeText={(t) => handleChange("fat_percentage", t)}
          style={input}
          keyboardType="decimal-pad"
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 10 }}>
          <RadioButton 
            label="Low" 
            value="Low" 
            isSelected={form.fat_level === "Low"}
            onPress={() => handleRadioPress("fat_level", "Low")}
          />
          <RadioButton 
            label="Healthy" 
            value="Healthy" 
            isSelected={form.fat_level === "Healthy"}
            onPress={() => handleRadioPress("fat_level", "Healthy")}
          />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <RadioButton 
            label="Overweight" 
            value="Overweight" 
            isSelected={form.fat_level === "Overweight"}
            onPress={() => handleRadioPress("fat_level", "Overweight")}
          />
          <RadioButton 
            label="Obese" 
            value="Obese" 
            isSelected={form.fat_level === "Obese"}
            onPress={() => handleRadioPress("fat_level", "Obese")}
          />
        </View>

        {/* CARDIO */}
        <Text style={title}>Cardio</Text>

        <TextInput
          placeholder="Speed (km)"
          placeholderTextColor="#777"
          value={form.speed_km}
          onChangeText={(t) => handleChange("speed_km", t)}
          style={input}
          keyboardType="decimal-pad"
        />

        <TextInput
          placeholder="Heart Rate (bpm)"
          placeholderTextColor="#777"
          value={form.heart_rate}
          onChangeText={(t) => handleChange("heart_rate", t)}
          style={input}
          keyboardType="numeric"
        />

        {/* MUSCLE */}
        <Text style={title}>Muscle Endurance</Text>

        {MuscleRow("Push Ups", "push_ups")}
        {MuscleRow("Squats", "squats")}
        {MuscleRow("Plank Hold", "plank_hold")}
        {MuscleRow("Shoulder", "shoulder")}
        {MuscleRow("Biceps", "biceps")}
        {MuscleRow("Triceps", "triceps")}
        {MuscleRow("Curl Ups", "curl_ups")}

        {/* BUTTONS */}
        <View style={{ flexDirection: "row", marginTop: 20, marginBottom: 40 }}>
          <TouchableOpacity style={btnGray} onPress={onPrevious}>
            <Text style={btnText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity style={btnOrange} onPress={handleNextPress}>
            <Text style={btnText}>Next</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
};

export default FitnessScreening;

const input = {
  backgroundColor: "#111",
  borderColor: "#333",
  borderWidth: 1,
  borderRadius: 8,
  padding: 10,
  color: "white",
  marginBottom: 10,
};

const title = {
  color: "#f97316",
  fontWeight: "bold",
  marginTop: 20,
  marginBottom: 10,
};

const btnGray = {
  flex: 1,
  backgroundColor: "#444",
  padding: 12,
  borderRadius: 8,
  marginRight: 6,
};

const btnOrange = {
  flex: 1,
  backgroundColor: "#f97316",
  padding: 12,
  borderRadius: 8,
  marginLeft: 6,
};

const btnText = {
  color: "white",
  textAlign: "center",
  fontWeight: "bold",
};