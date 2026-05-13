import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import * as notificationService from "../services/notificationService";
import BackButton from "./BackButton";
import SessionTrackerPage from "./pt-form-user/SessionTrackerPage";

const safeParse = (value) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

const buildInitialForm = (userData, memberData) => ({
  name: memberData?.name || userData.username || "",
  sessions: memberData?.sessions || [
    {
      session_no: 1,
      date: "",
      workout: "",
      status: "Pending",
      client_sign: userData.username || userData.name || "",
      trainer_sign: memberData?.trainer_name_assigned || userData.username || userData.name || "",
    },
  ],
  trainer_name_assigned: memberData?.trainer_name_assigned || "",
  ...memberData,
});

export default function SessionTrackerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [member, setMember] = useState(null);
  const [formData, setFormData] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTrackerData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const memberRes = await api.get(`/members/user/${user.id}`);
      const memberData = memberRes.data || null;
      setMember(memberData);

      let initialForm = buildInitialForm(user, memberData);
      if (memberData?.id) {
        try {
          const ptRes = await api.get(`/pt-forms/${memberData.id}`);
          if (ptRes.data && ptRes.data.form_data) {
            const savedData = safeParse(ptRes.data.form_data);
            initialForm = { ...initialForm, ...savedData };
          }
        } catch (error) {
          console.log("No saved PT form available", error);
        }
      }

      setFormData(initialForm);
    } catch (error) {
      console.error("Failed to load session tracker data", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTrackerData();
  }, [fetchTrackerData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrackerData();
    setRefreshing(false);
  };

  const saveSessionData = async (updatedData) => {
    if (!member?.id) {
      Toast.show({
        type: "error",
        text1: "Unable to save",
        text2: "Your account is not linked to a gym member record.",
      });
      return;
    }

    try {
      await api.post("/pt-forms", {
        member_id: member.id,
        user_id: user.id,
        formData: updatedData,
      });
      setFormData(updatedData);

      const trainerId =
        member?.trainer_user_id ||
        member?.trainerUserId ||
        member?.trainer_id ||
        member?.trainerId ||
        member?.assigned_trainer_id ||
        member?.assignedTrainerId ||
        member?.trainer?.id ||
        null;

      const hasCompletedSession = Array.isArray(updatedData.sessions)
        ? updatedData.sessions.some((session) => String(session.status).toLowerCase() === 'completed')
        : false;

      if (trainerId && hasCompletedSession) {
        await notificationService.triggerServerPushNotification(
          trainerId,
          'Session Tracker Updated',
          `${member?.name || user?.username || 'A member'} completed their session tracker.`,
          {
            type: 'user_session_tracker_update',
            userId: String(user.id),
            memberName: member?.name || '',
          }
        );
      }

      Toast.show({
        type: "success",
        text1: "Sessions Saved",
        text2: "Session tracker was saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save session tracker", error);
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: error.response?.data?.message || "Unable to save session tracker.",
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: "#000",
        borderBottomWidth: 1,
        borderBottomColor: "#111",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <BackButton style={{ marginRight: 12 }} />
          <View>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: -0.3 }}>Session Tracker</Text>
            <Text style={{ color: "#4b5563", fontSize: 10, textTransform: "uppercase", letterSpacing: 2 }}>PT Sessions</Text>
          </View>
        </View>

        <View style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: "#e11d1d",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#e11d1d",
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 8,
        }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>S</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <ActivityIndicator size="large" color="#e11d1d" />
          <Text style={{ color: "#6b7280", marginTop: 16 }}>Loading session tracker...</Text>
        </View>
      ) : (
        <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e11d1d" />
        }
      >
          <SessionTrackerPage
            formData={formData}
            onPrevious={() => router.back()}
            onSaved={saveSessionData}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
