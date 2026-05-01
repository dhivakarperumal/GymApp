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

const HealthHistoryPage = ({ formData = {}, onNext, onPrevious, isFirstStep = false }) => {
  const [form, setForm] = useState({
    medications: "No",
    med1: "", dose1: "", reason1: "",
    med2: "", dose2: "", reason2: "",
    med3: "", dose3: "", reason3: "",
    allergies: "", surgeries1: "", surgeries2: "", surgeries3: "",
    exercise_program: "No",
    sport1: "", sport2: "", sport3: "", sport4: "", sport5: "", sport6: "",
    smoking: "", alcohol: "", food_preference: "", supplements: "",
  });

  useEffect(() => {
    if (formData) setForm((prev) => ({ ...prev, ...formData }));
  }, [formData]);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const MedRow = ({ label, nameField, doseField, reasonField }) => (
    <View style={{ marginBottom: 20, backgroundColor: "#111", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1f1f1f" }}>
      <Text style={{ color: "#6b7280", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>{label}</Text>
      <View style={$field}>
        <Text style={$label}>Medication Name</Text>
        <TextInput value={form[nameField]} onChangeText={(v) => set(nameField, v)} placeholder="Name" placeholderTextColor="#444" style={$input} />
      </View>
      <View style={$field}>
        <Text style={$label}>Dosage / Frequency</Text>
        <TextInput value={form[doseField]} onChangeText={(v) => set(doseField, v)} placeholder="e.g. 500mg twice daily" placeholderTextColor="#444" style={$input} />
      </View>
      <View style={{ marginBottom: 0 }}>
        <Text style={$label}>Reason</Text>
        <TextInput value={form[reasonField]} onChangeText={(v) => set(reasonField, v)} placeholder="Reason for taking" placeholderTextColor="#444" style={$input} />
      </View>
    </View>
  );

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
      {/* MEDICATIONS */}
      <View style={$card}>
        <Text style={$sectionTitle}>Medications</Text>

        <View style={$field}>
          <Text style={$label}>Currently Taking Medications?</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {["Yes", "No"].map((opt) => (
              <TouchableOpacity key={opt} onPress={() => set("medications", opt)} style={$toggleBtn(form.medications === opt)}>
                <Text style={$toggleText(form.medications === opt)}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <MedRow label="Medication 1" nameField="med1" doseField="dose1" reasonField="reason1" />
        <MedRow label="Medication 2" nameField="med2" doseField="dose2" reasonField="reason2" />
        <MedRow label="Medication 3" nameField="med3" doseField="dose3" reasonField="reason3" />
      </View>

      {/* ALLERGIES & SURGERIES */}
      <View style={$card}>
        <Text style={$sectionTitle}>Allergies & Surgeries</Text>

        <View style={$field}>
          <Text style={$label}>Allergies</Text>
          <TextInput value={form.allergies} onChangeText={(v) => set("allergies", v)} placeholder="List any known allergies" placeholderTextColor="#444" multiline style={[$input, { height: 72, textAlignVertical: "top" }]} />
        </View>

        <Text style={{ color: "#6b7280", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Surgeries / Accidents</Text>
        <View style={$field}>
          <TextInput value={form.surgeries1} onChangeText={(v) => set("surgeries1", v)} placeholder="Surgery / Accident 1" placeholderTextColor="#444" style={$input} />
        </View>
        <View style={$field}>
          <TextInput value={form.surgeries2} onChangeText={(v) => set("surgeries2", v)} placeholder="Surgery / Accident 2" placeholderTextColor="#444" style={$input} />
        </View>
        <View style={{ marginBottom: 0 }}>
          <TextInput value={form.surgeries3} onChangeText={(v) => set("surgeries3", v)} placeholder="Surgery / Accident 3" placeholderTextColor="#444" style={$input} />
        </View>
      </View>

      {/* LIFESTYLE */}
      <View style={$card}>
        <Text style={$sectionTitle}>Lifestyle</Text>

        <View style={$field}>
          <Text style={$label}>Exercise Program?</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {["Yes", "No"].map((opt) => (
              <TouchableOpacity key={opt} onPress={() => set("exercise_program", opt)} style={$toggleBtn(form.exercise_program === opt)}>
                <Text style={$toggleText(form.exercise_program === opt)}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={$field}>
          <Text style={$label}>Sports / Activities</Text>
          {["sport1", "sport2", "sport3", "sport4", "sport5", "sport6"].map((field, i) => (
            <TextInput key={field} value={form[field]} onChangeText={(v) => set(field, v)} placeholder={`Sport ${i + 1}`} placeholderTextColor="#444" style={[$input, { marginBottom: i < 5 ? 10 : 0 }]} />
          ))}
        </View>

        <View style={$field}>
          <Text style={$label}>Smoking</Text>
          <TextInput value={form.smoking} onChangeText={(v) => set("smoking", v)} placeholder="e.g. Non-smoker, 5 per day" placeholderTextColor="#444" style={$input} />
        </View>

        <View style={$field}>
          <Text style={$label}>Alcohol</Text>
          <TextInput value={form.alcohol} onChangeText={(v) => set("alcohol", v)} placeholder="e.g. Occasional, None" placeholderTextColor="#444" style={$input} />
        </View>

        <View style={$field}>
          <Text style={$label}>Food Preference</Text>
          <TextInput value={form.food_preference} onChangeText={(v) => set("food_preference", v)} placeholder="e.g. Veg, Non-Veg" placeholderTextColor="#444" style={$input} />
        </View>

        <View style={{ marginBottom: 0 }}>
          <Text style={$label}>Supplements</Text>
          <TextInput value={form.supplements} onChangeText={(v) => set("supplements", v)} placeholder="List any supplements" placeholderTextColor="#444" style={$input} />
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

export default HealthHistoryPage;
