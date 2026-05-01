import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

  useEffect(() => {
    setForm(prev => ({ ...prev, ...initialData }));
  }, [initialData]);

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // ✅ AUTO FAT LEVEL LOGIC (same as web)
  useEffect(() => {
    if (manualFat) return;

    const fat = parseFloat(form.fat_percentage);
    if (isNaN(fat)) return;

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

    setForm(prev => ({ ...prev, fat_level: level }));
  }, [form.fat_percentage, initialData?.gender]);

  const Radio = ({ label, value, name }) => (
    <TouchableOpacity
      onPress={() => {
        if (name === "fat_level") setManualFat(true);
        handleChange(name, value);
      }}
      style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}
    >
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: form[name] === value ? "#f97316" : "#aaa",
          backgroundColor: form[name] === value ? "#f97316" : "transparent",
          marginRight: 6,
        }}
      />
      <Text style={{ color: "white" }}>{label}</Text>
    </TouchableOpacity>
  );

  const MuscleRow = (label, prefix) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: "#ccc", marginBottom: 6 }}>{label}</Text>

      <TextInput
        placeholder="Count"
        placeholderTextColor="#777"
        value={form[`${prefix}_count`]}
        onChangeText={(t) => handleChange(`${prefix}_count`, t)}
        style={input}
      />

      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <Radio label="Superior" value="Superior" name={`${prefix}_level`} />
        <Radio label="Good" value="Good" name={`${prefix}_level`} />
        <Radio label="Poor" value="Poor" name={`${prefix}_level`} />
      </View>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "black" }}>
      <View style={{ padding: 20 }}>

        {/* RESTING */}
        <Text style={title}>Resting Parameters</Text>

        <TextInput
          placeholder="Height (cm)"
          placeholderTextColor="#777"
          value={form.height}
          onChangeText={(t) => handleChange("height", t)}
          style={input}
        />

        <TextInput
          placeholder="Weight (kg)"
          placeholderTextColor="#777"
          value={form.weight}
          onChangeText={(t) => handleChange("weight", t)}
          style={input}
        />

        <TextInput
          placeholder="Resting HR"
          placeholderTextColor="#777"
          value={form.resting_hr}
          onChangeText={(t) => handleChange("resting_hr", t)}
          style={input}
        />

        {/* FAT */}
        <Text style={title}>Fat %</Text>

        <TextInput
          placeholder="Fat %"
          placeholderTextColor="#777"
          value={form.fat_percentage}
          onChangeText={(t) => handleChange("fat_percentage", t)}
          style={input}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <Radio label="Low" value="Low" name="fat_level" />
          <Radio label="Healthy" value="Healthy" name="fat_level" />
          <Radio label="Overweight" value="Overweight" name="fat_level" />
          <Radio label="Obese" value="Obese" name="fat_level" />
        </View>

        {/* CARDIO */}
        <Text style={title}>Cardio</Text>

        <TextInput
          placeholder="Speed (km)"
          placeholderTextColor="#777"
          value={form.speed_km}
          onChangeText={(t) => handleChange("speed_km", t)}
          style={input}
        />

        <TextInput
          placeholder="Heart Rate"
          placeholderTextColor="#777"
          value={form.heart_rate}
          onChangeText={(t) => handleChange("heart_rate", t)}
          style={input}
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
        <View style={{ flexDirection: "row", marginTop: 20 }}>
          <TouchableOpacity style={btnGray} onPress={onPrevious}>
            <Text style={btnText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity style={btnOrange} onPress={() => onNext(form)}>
            <Text style={btnText}>Next</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
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