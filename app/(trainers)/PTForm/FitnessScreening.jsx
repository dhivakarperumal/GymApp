import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

const FitnessScreening = ({ onNext, onPrevious, initialData = {} }) => {
  const [form, setForm] = useState({
    fs_height: "",
    fs_weight: "",
    fs_resting_hr: "",

    fs_fat_percentage: "",
    fs_fat_level: "",

    fs_speed_km: "",
    fs_heart_rate: "",

    fs_push_ups_count: "",
    fs_push_ups_level: "",

    fs_squats_count: "",
    fs_squats_level: "",

    fs_plank_hold_count: "",
    fs_plank_hold_level: "",

    fs_shoulder_count: "",
    fs_shoulder_level: "",

    fs_biceps_count: "",
    fs_biceps_level: "",

    fs_triceps_count: "",
    fs_triceps_level: "",

    fs_curl_ups_count: "",
    fs_curl_ups_level: "",
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

    const fat = parseFloat(form.fs_fat_percentage);
    if (isNaN(fat)) return;

    let level = "";

    if (fat < 8) level = "Low";
    else if (fat <= 19) level = "Healthy";
    else if (fat <= 25) level = "Overweight";
    else level = "Obese";

    setForm(prev => ({ ...prev, fs_fat_level: level }));
  }, [form.fs_fat_percentage]);

  const Radio = ({ label, value, name }) => (
    <TouchableOpacity
      onPress={() => {
        if (name === "fs_fat_level") setManualFat(true);
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
          value={form.fs_height}
          onChangeText={(t) => handleChange("fs_height", t)}
          style={input}
        />

        <TextInput
          placeholder="Weight (kg)"
          placeholderTextColor="#777"
          value={form.fs_weight}
          onChangeText={(t) => handleChange("fs_weight", t)}
          style={input}
        />

        <TextInput
          placeholder="Resting HR"
          placeholderTextColor="#777"
          value={form.fs_resting_hr}
          onChangeText={(t) => handleChange("fs_resting_hr", t)}
          style={input}
        />

        {/* FAT */}
        <Text style={title}>Fat %</Text>

        <TextInput
          placeholder="Fat %"
          placeholderTextColor="#777"
          value={form.fs_fat_percentage}
          onChangeText={(t) => handleChange("fs_fat_percentage", t)}
          style={input}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <Radio label="Low" value="Low" name="fs_fat_level" />
          <Radio label="Healthy" value="Healthy" name="fs_fat_level" />
          <Radio label="Overweight" value="Overweight" name="fs_fat_level" />
          <Radio label="Obese" value="Obese" name="fs_fat_level" />
        </View>

        {/* CARDIO */}
        <Text style={title}>Cardio</Text>

        <TextInput
          placeholder="Speed (km)"
          placeholderTextColor="#777"
          value={form.fs_speed_km}
          onChangeText={(t) => handleChange("fs_speed_km", t)}
          style={input}
        />

        <TextInput
          placeholder="Heart Rate"
          placeholderTextColor="#777"
          value={form.fs_heart_rate}
          onChangeText={(t) => handleChange("fs_heart_rate", t)}
          style={input}
        />

        {/* MUSCLE */}
        <Text style={title}>Muscle Endurance</Text>

        {MuscleRow("Push Ups", "fs_push_ups")}
        {MuscleRow("Squats", "fs_squats")}
        {MuscleRow("Plank Hold", "fs_plank_hold")}
        {MuscleRow("Shoulder", "fs_shoulder")}
        {MuscleRow("Biceps", "fs_biceps")}
        {MuscleRow("Triceps", "fs_triceps")}
        {MuscleRow("Curl Ups", "fs_curl_ups")}

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