import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

const $label = { color: "#9ca3af", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 };
const $input = { backgroundColor: "#111", color: "#fff", padding: 16, borderRadius: 16, fontSize: 15, borderWidth: 1, borderColor: "#222" };
const $field = { marginBottom: 20 };
const $sectionTitle = { color: "#e11d1d", fontSize: 13, fontWeight: "900", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, marginTop: 4 };
const $card = { backgroundColor: "#0d0d0d", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#1a1a1a", marginBottom: 20 };
const $toggleBtn = (active) => ({
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: active ? "#e11d1d" : "#333",
  backgroundColor: active ? "#e11d1d22" : "transparent",
});
const $toggleText = (active) => ({ color: active ? "#ff6b6b" : "#666", fontWeight: "700", fontSize: 14 });

const questions = [
  "Heart Attack",
  "Heart bypass or any other cardiac surgery",
  "Chest discomfort with Digine",
  "Palpitation",
  "Epilepsy",
  "Fainting or dizziness or loss of consciousness",
  "Hypertension (High blood pressure)",
  "Family history of heart disease (Male < 55 yrs & Female < 65 yrs)",
  "Rheumatic fever",
  "Shortness of breath with or without exercise",
  "Any Breathing difficulties / Wheezing / Asthma",
  "High blood cholesterol (lipid)",
  "Diabetes or impaired blood sugar",
  "Stroke",
  "Recent hospitalization / other medical conditions",
  "Orthopedic problem (including arthritis)",
];

const HealthHistory2Page = ({ formData = {}, onNext, onPrevious, isFirstStep = false }) => {
  const [form, setForm] = useState({
    bp: "", sugar: "", cholesterol: "", thyroid: "", uric: "", serum3d: "",
  });

  useEffect(() => {
    if (formData) setForm((prev) => ({ ...prev, ...formData }));
  }, [formData]);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
      {/* MEDICAL QUESTIONNAIRE */}
      <View style={$card}>
        <Text style={$sectionTitle}>Medical Questionnaire</Text>
        <Text style={{ color: "#4b5563", fontSize: 12, marginBottom: 20, lineHeight: 18 }}>
          Please answer Yes or No for each condition below
        </Text>

        {questions.map((question, index) => (
          <View key={index} style={{
            marginBottom: 16,
            backgroundColor: "#111",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#1f1f1f",
          }}>
            <Text style={{ color: "#d1d5db", fontSize: 14, lineHeight: 20, marginBottom: 14 }}>
              <Text style={{ color: "#e11d1d", fontWeight: "900" }}>{index + 1}. </Text>
              {question}
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {["Yes", "No"].map((opt) => (
                <TouchableOpacity key={opt} onPress={() => set(`q${index}`, opt)} style={$toggleBtn(form[`q${index}`] === opt)}>
                  <Text style={$toggleText(form[`q${index}`] === opt)}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {(index === 14 || index === 15) && (
              <View style={{ marginTop: 12 }}>
                <TextInput
                  value={form[`specify${index}`] || ""}
                  onChangeText={(v) => set(`specify${index}`, v)}
                  placeholder="Please specify..."
                  placeholderTextColor="#444"
                  style={$input}
                />
              </View>
            )}
          </View>
        ))}
      </View>

      {/* BLOOD METRICS */}
      <View style={$card}>
        <Text style={$sectionTitle}>Blood & Metabolic Metrics</Text>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={$label}>Blood Pressure</Text>
            <TextInput value={form.bp} onChangeText={(v) => set("bp", v)} placeholder="e.g. 120/80" placeholderTextColor="#444" style={$input} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={$label}>Blood Sugar</Text>
            <TextInput value={form.sugar} onChangeText={(v) => set("sugar", v)} placeholder="mg/dL" placeholderTextColor="#444" keyboardType="numeric" style={$input} />
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={$label}>Cholesterol</Text>
            <TextInput value={form.cholesterol} onChangeText={(v) => set("cholesterol", v)} placeholder="mg/dL" placeholderTextColor="#444" keyboardType="numeric" style={$input} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={$label}>Thyroid Level</Text>
            <TextInput value={form.thyroid} onChangeText={(v) => set("thyroid", v)} placeholder="TSH level" placeholderTextColor="#444" keyboardType="numeric" style={$input} />
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 0 }}>
          <View style={{ flex: 1 }}>
            <Text style={$label}>Uric Acid</Text>
            <TextInput value={form.uric} onChangeText={(v) => set("uric", v)} placeholder="mg/dL" placeholderTextColor="#444" keyboardType="numeric" style={$input} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={$label}>Serum 3D</Text>
            <TextInput value={form.serum3d} onChangeText={(v) => set("serum3d", v)} placeholder="Value" placeholderTextColor="#444" keyboardType="numeric" style={$input} />
          </View>
        </View>
      </View>

      {/* NAV BUTTONS */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
        {!isFirstStep && (
          <TouchableOpacity onPress={onPrevious} style={{ flex: 1, backgroundColor: "#222", borderRadius: 16, padding: 18, alignItems: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>← Previous</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => onNext(form)} style={{ flex: 1, backgroundColor: "#e11d1d", borderRadius: 16, padding: 18, alignItems: "center", shadowColor: "#e11d1d", shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 }}>
          <Text style={{ color: "#fff", fontWeight: "900", letterSpacing: 1 }}>Next →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HealthHistory2Page;
