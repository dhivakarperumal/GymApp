import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const $label = { color: "#9ca3af", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 };
const $input = { backgroundColor: "#111", color: "#fff", padding: 16, borderRadius: 16, fontSize: 15, borderWidth: 1, borderColor: "#222" };
const $inputDisabled = { backgroundColor: "#0a0a0a", color: "#555", padding: 16, borderRadius: 16, fontSize: 15, borderWidth: 1, borderColor: "#1a1a1a" };
const $field = { marginBottom: 20 };
const $sectionTitle = { color: "#e11d1d", fontSize: 13, fontWeight: "900", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, marginTop: 4 };
const $card = { backgroundColor: "#0d0d0d", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#1a1a1a", marginBottom: 20 };

const EnquiryFormPage = ({ formData = {}, onNext, onPrevious, isFirstStep = false }) => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", dob: "", age: "",
    blood_group: "", gender: "", address: "", employer: "", occupation: "",
    emergency_contact_name: "", emergency_contact_relationship: "",
    emergency_contact_address: "", emergency_contact_phone_home: "",
    emergency_contact_phone_work: "", fitness_goal: "", message: "",
    height: "", weight: "", bmi: "",
  });

  useEffect(() => {
    if (formData) {
      setForm((prev) => ({ ...prev, ...formData, dob: formData.dob || "", age: formData.age || "" }));
    }
  }, [formData]);

  useEffect(() => {
    if (form.height && form.weight) {
      const h = parseFloat(form.height) / 100;
      const w = parseFloat(form.weight);
      if (h > 0 && w > 0) {
        setForm((prev) => ({ ...prev, bmi: (w / (h * h)).toFixed(1) }));
        return;
      }
    }
    setForm((prev) => ({ ...prev, bmi: "" }));
  }, [form.height, form.weight]);

  useEffect(() => {
    if (form.dob) {
      const parts = form.dob.split("-");
      if (parts.length === 3) {
        const [year, month, day] = parts.map((v) => parseInt(v, 10));
        const dobDate = new Date(year, month - 1, day);
        if (!Number.isNaN(dobDate.getTime())) {
          const age = new Date().getFullYear() - dobDate.getFullYear();
          setForm((prev) => ({ ...prev, age: age >= 0 ? String(age) : "" }));
        }
      }
    }
  }, [form.dob]);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
      {/* PERSONAL INFO */}
      <View style={$card}>
        <Text style={$sectionTitle}>Personal Information</Text>

        <View style={$field}>
          <Text style={$label}>Full Name</Text>
          <TextInput value={form.name} onChangeText={(v) => set("name", v)} placeholder="Enter full name" placeholderTextColor="#444" style={$input} />
        </View>

        <View style={$field}>
          <Text style={$label}>Email Address</Text>
          <TextInput value={form.email} onChangeText={(v) => set("email", v)} placeholder="Email" placeholderTextColor="#444" keyboardType="email-address" style={$input} />
        </View>

        <View style={$field}>
          <Text style={$label}>Phone Number</Text>
          <TextInput value={form.phone} onChangeText={(v) => set("phone", v)} placeholder="Phone" placeholderTextColor="#444" keyboardType="phone-pad" style={$input} />
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={$label}>Date of Birth</Text>
            <TextInput value={form.dob} onChangeText={(v) => set("dob", v)} placeholder="YYYY-MM-DD" placeholderTextColor="#444" style={$input} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={$label}>Age</Text>
            <TextInput value={form.age} onChangeText={(v) => set("age", v)} placeholder="Age" placeholderTextColor="#444" keyboardType="numeric" style={$input} />
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={$label}>Height (cm)</Text>
            <TextInput value={form.height} onChangeText={(v) => set("height", v)} placeholder="cm" placeholderTextColor="#444" keyboardType="numeric" style={$input} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={$label}>Weight (kg)</Text>
            <TextInput value={form.weight} onChangeText={(v) => set("weight", v)} placeholder="kg" placeholderTextColor="#444" keyboardType="numeric" style={$input} />
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={$label}>BMI (Auto)</Text>
            <TextInput value={form.bmi} editable={false} placeholder="—" placeholderTextColor="#444" style={$inputDisabled} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={$label}>Blood Group</Text>
            <TextInput value={form.blood_group} onChangeText={(v) => set("blood_group", v)} placeholder="e.g. A+" placeholderTextColor="#444" style={$input} />
          </View>
        </View>

        <View style={$field}>
          <Text style={$label}>Gender</Text>
          <TextInput value={form.gender} onChangeText={(v) => set("gender", v)} placeholder="Gender" placeholderTextColor="#444" style={$input} />
        </View>

        <View style={{ marginBottom: 0 }}>
          <Text style={$label}>Address</Text>
          <TextInput value={form.address} onChangeText={(v) => set("address", v)} placeholder="Full address" placeholderTextColor="#444" multiline style={[$input, { height: 80, textAlignVertical: "top" }]} />
        </View>
      </View>

      {/* WORK INFO */}
      <View style={$card}>
        <Text style={$sectionTitle}>Work Information</Text>

        <View style={$field}>
          <Text style={$label}>Employer</Text>
          <TextInput value={form.employer} onChangeText={(v) => set("employer", v)} placeholder="Employer" placeholderTextColor="#444" style={$input} />
        </View>

        <View style={{ marginBottom: 0 }}>
          <Text style={$label}>Occupation</Text>
          <TextInput value={form.occupation} onChangeText={(v) => set("occupation", v)} placeholder="Occupation" placeholderTextColor="#444" style={$input} />
        </View>
      </View>

      {/* EMERGENCY CONTACT */}
      <View style={$card}>
        <Text style={$sectionTitle}>Emergency Contact</Text>

        <View style={$field}>
          <Text style={$label}>Contact Name</Text>
          <TextInput value={form.emergency_contact_name} onChangeText={(v) => set("emergency_contact_name", v)} placeholder="Full name" placeholderTextColor="#444" style={$input} />
        </View>

        <View style={$field}>
          <Text style={$label}>Relationship</Text>
          <TextInput value={form.emergency_contact_relationship} onChangeText={(v) => set("emergency_contact_relationship", v)} placeholder="e.g. Spouse, Parent" placeholderTextColor="#444" style={$input} />
        </View>

        <View style={$field}>
          <Text style={$label}>Contact Address</Text>
          <TextInput value={form.emergency_contact_address} onChangeText={(v) => set("emergency_contact_address", v)} placeholder="Address" placeholderTextColor="#444" multiline style={[$input, { height: 72, textAlignVertical: "top" }]} />
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 0 }}>
          <View style={{ flex: 1 }}>
            <Text style={$label}>Home Phone</Text>
            <TextInput value={form.emergency_contact_phone_home} onChangeText={(v) => set("emergency_contact_phone_home", v)} placeholder="Home" placeholderTextColor="#444" keyboardType="phone-pad" style={$input} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={$label}>Work Phone</Text>
            <TextInput value={form.emergency_contact_phone_work} onChangeText={(v) => set("emergency_contact_phone_work", v)} placeholder="Work" placeholderTextColor="#444" keyboardType="phone-pad" style={$input} />
          </View>
        </View>
      </View>

      {/* FITNESS */}
      <View style={$card}>
        <Text style={$sectionTitle}>Fitness Goals</Text>

        <View style={$field}>
          <Text style={$label}>Fitness Goal</Text>
          <TextInput value={form.fitness_goal} onChangeText={(v) => set("fitness_goal", v)} placeholder="What are your fitness goals?" placeholderTextColor="#444" multiline style={[$input, { height: 80, textAlignVertical: "top" }]} />
        </View>

        <View style={{ marginBottom: 0 }}>
          <Text style={$label}>Additional Notes</Text>
          <TextInput value={form.message} onChangeText={(v) => set("message", v)} placeholder="Any additional information..." placeholderTextColor="#444" multiline style={[$input, { height: 80, textAlignVertical: "top" }]} />
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

export default EnquiryFormPage;
