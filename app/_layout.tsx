import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../context/AuthContext";
import "./global.css";
import RootNavigator from "./RootNavigator";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}