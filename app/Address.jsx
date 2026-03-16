import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import BackButton from "./BackButton";
import Header from "./Header";

export default function Address() {

  const { user } = useAuth();
  const userId = user?.id;

  const [addresses, setAddresses] = useState([]);
  const [editAddress, setEditAddress] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "India"
  });

  const states = [
    "Tamil Nadu",
    "Kerala",
    "Karnataka",
    "Andhra Pradesh",
    "Telangana",
    "Delhi",
    "Maharashtra",
    "Gujarat",
    "Punjab",
    "Rajasthan",
    "West Bengal"
  ];

  /* FETCH ADDRESSES */

  const fetchAddresses = async () => {
    try {
      const res = await api.get(`/addresses/user/${userId}`);
      setAddresses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Fetch address error", err);
    }
  };

  useEffect(() => {
    if (userId) fetchAddresses();
  }, [userId]);

  /* VALIDATION */

  const validateForm = () => {

    if (
      !form.name ||
      !form.phone ||
      !form.email ||
      !form.address ||
      !form.city ||
      !form.state ||
      !form.zip ||
      !form.country
    ) {

      Toast.show({
        type: "error",
        text1: "All fields required"
      });

      return false;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      Toast.show({
        type: "error",
        text1: "Enter valid phone number"
      });
      return false;
    }

    if (!/^\d{6}$/.test(form.zip)) {
      Toast.show({
        type: "error",
        text1: "Enter valid 6 digit pincode"
      });
      return false;
    }

    return true;
  };

  /* SAVE ADDRESS */

  const saveAddress = async () => {

    if (!validateForm()) return;

    try {

      const payload = {
        user_id: userId,
        ...form
      };

      if (editAddress) {

        await api.put(`/addresses/${editAddress.id}`, payload);

        Toast.show({
          type: "success",
          text1: "Address Updated"
        });

      } else {

        await api.post("/addresses", payload);

        Toast.show({
          type: "success",
          text1: "Address Added"
        });

      }

      setForm({
        name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "India"
      });

      setEditAddress(null);

      fetchAddresses();

    } catch (err) {

      console.log("Save error", err);

      Toast.show({
        type: "error",
        text1: "Failed to save address"
      });

    }

  };

  /* DELETE ADDRESS */

  const deleteAddress = async (id) => {

    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete?",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: async () => {

            try {

              await api.delete(`/addresses/${id}`);

              Toast.show({
                type: "success",
                text1: "Address Deleted"
              });

              fetchAddresses();

            } catch (err) {

              console.log("Delete error", err);

              Toast.show({
                type: "error",
                text1: "Delete failed"
              });

            }

          }
        }
      ]
    );
  };

  /* EDIT ADDRESS */

  const startEdit = (addr) => {

    setEditAddress(addr);

    setForm({
      name: addr.name || "",
      phone: addr.phone || "",
      email: addr.email || "",
      address: addr.address || "",
      city: addr.city || "",
      state: addr.state || "",
      zip: addr.zip || "",
      country: addr.country || "India"
    });

  };

  return (
    <SafeAreaView className="flex-1 bg-card">

      <Header />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        >

          <BackButton style={{ marginLeft: 20, marginTop: 20 }} />

          {/* SAVED ADDRESSES */}

          {addresses.map((addr) => (

            <View
              key={addr.id}
              className="bg-darkcard border border-border rounded-3xl p-5 mt-6"
            >

              <View className="flex-row justify-between">

                <View className="flex-1">

                  <Text className="text-background text-lg font-bold">
                    {addr.name}
                  </Text>

                  <Text className="text-textSecondary mt-1">
                    {addr.address}
                  </Text>

                  <Text className="text-textSecondary">
                    {addr.city}, {addr.state} - {addr.zip}
                  </Text>

                  <Text className="text-textSecondary">
                    {addr.country}
                  </Text>

                  <Text className="text-textSecondary">
                    {addr.email}
                  </Text>

                  <Text className="text-textSecondary mt-1">
                    {addr.phone}
                  </Text>

                </View>

                <View className="flex-row">

                  <TouchableOpacity
                    onPress={() => startEdit(addr)}
                    className="bg-card p-3 rounded-xl border border-border mr-3 self-start"
                  >
                    <Ionicons name="create-outline" size={18} color="#e11d1d" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => deleteAddress(addr.id)}
                    className="bg-card p-3 rounded-xl border border-border self-start"
                  >
                    <Ionicons name="trash-outline" size={18} color="#e11d1d" />
                  </TouchableOpacity>

                </View>

              </View>

            </View>

          ))}

          {/* ADDRESS FORM */}

          <View className="bg-darkcard border border-border rounded-3xl p-6 mt-6">

            <Text className="text-background text-lg font-bold mb-6">
              {editAddress ? "Edit Address" : "Add New Address"}
            </Text>

            {["name", "phone", "email", "address", "city", "zip", "country"].map((key) => (

              <View
                key={key}
                className="bg-card border border-border rounded-xl px-4 mb-4"
              >

                <TextInput
                  placeholder={key.toUpperCase()}
                  placeholderTextColor="#777"
                  value={form[key]}
                  keyboardType={
                    key === "phone"
                      ? "number-pad"
                      : key === "zip"
                        ? "number-pad"
                        : "default"
                  }
                  onChangeText={(text) =>
                    setForm({ ...form, [key]: text })
                  }
                  className="text-background py-4"
                />

              </View>

            ))}

            {/* STATE */}

            <View className="bg-card border border-border rounded-xl mb-6">

              <Picker
                selectedValue={form.state}
                dropdownIconColor="#888"
                style={{ color: "white" }}
                onValueChange={(value) =>
                  setForm({ ...form, state: value })
                }
              >

                <Picker.Item label="Select State" value="" />

                {states.map((state) => (
                  <Picker.Item key={state} label={state} value={state} />
                ))}

              </Picker>

            </View>

            {/* SAVE BUTTON */}

            <TouchableOpacity
              onPress={saveAddress}
              className="bg-primary py-4 rounded-xl items-center"
            >

              <Text className="text-white font-bold text-base">

                {editAddress ? "Update Address" : "Add Address"}

              </Text>

            </TouchableOpacity>

          </View>

          <View className="h-20" />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}