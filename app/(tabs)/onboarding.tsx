import { useHydrationStore } from "@/store/HydrationStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const router = useRouter();
  const { setUserData, calculateTarget, setTarget } = useHydrationStore();

  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);

  const handleFinish = () => {
    if (!name.trim() || !weight || !gender) {
      Alert.alert(
        "Data Belum Lengkap",
        "Mohon isi nama, berat badan dan pilih jenis kelamin Anda."
      );
      return;
    }

    const weightNum = parseFloat(weight);

    // 1. Hitung Target Otomatis
    const calculatedTarget = calculateTarget(weightNum, gender);

    // 2. Simpan ke Store
    setTarget(calculatedTarget);
    setUserData({
      name: name,
      weight: weightNum,
      gender: gender,
      hasOnboarded: true,
    });

    // 3. Pindah ke Dashboard
    router.replace("/");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            justifyContent: "center",
          }}
        >
          {/* Header Image / Icon */}
          <View className="items-center mb-10">
            <View className="bg-water-bg p-6 rounded-full mb-4">
              <MaterialCommunityIcons
                name="water-percent"
                size={60}
                color="#82adfe"
              />
            </View>
            <Text className="text-3xl font-bold text-gray-800 text-center">
              Personalisasi
            </Text>
            <Text className="text-gray-500 text-center mt-2 px-4">
              Halo! Mari berkenalan dulu sebelum mulai hidup sehat.
            </Text>
          </View>

          {/* --- BARU: Input Nama --- */}
          <View className="mb-6">
            <Text className="text-gray-700 font-bold mb-3 ml-1">
              Nama Panggilan
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <Ionicons name="person-outline" size={24} color="#82adfe" />
              <TextInput
                className="flex-1 ml-3 text-lg font-bold text-gray-800"
                placeholder="Contoh: Syafik"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Input Berat Badan */}
          <View className="mb-8">
            <Text className="text-gray-700 font-bold mb-3 ml-1">
              Berat Badan (kg)
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <MaterialCommunityIcons
                name="scale-bathroom"
                size={24}
                color="#82adfe"
              />
              <TextInput
                className="flex-1 ml-3 text-lg font-bold text-gray-800"
                placeholder="Contoh: 65"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
          </View>

          {/* Input Gender */}
          <View className="mb-10">
            <Text className="text-gray-700 font-bold mb-3 ml-1">
              Jenis Kelamin
            </Text>
            <View className="flex-row gap-4">
              {/* Tombol Pria */}
              <TouchableOpacity
                onPress={() => setGender("male")}
                className={`flex-1 flex-row items-center justify-center p-4 rounded-xl border-2 ${
                  gender === "male"
                    ? "bg-water-bg border-water-primary"
                    : "bg-white border-gray-100"
                }`}
              >
                <Ionicons
                  name="male"
                  size={24}
                  color={gender === "male" ? "#82adfe" : "#9ca3af"}
                />
                <Text
                  className={`ml-2 font-bold ${gender === "male" ? "text-water-primary" : "text-gray-400"}`}
                >
                  Pria
                </Text>
              </TouchableOpacity>

              {/* Tombol Wanita */}
              <TouchableOpacity
                onPress={() => setGender("female")}
                className={`flex-1 flex-row items-center justify-center p-4 rounded-xl border-2 ${
                  gender === "female"
                    ? "bg-water-bg border-water-primary"
                    : "bg-white border-gray-100"
                }`}
              >
                <Ionicons
                  name="female"
                  size={24}
                  color={gender === "female" ? "#82adfe" : "#9ca3af"}
                />
                <Text
                  className={`ml-2 font-bold ${gender === "female" ? "text-water-primary" : "text-gray-400"}`}
                >
                  Wanita
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleFinish}
            className="bg-water-primary py-4 rounded-xl shadow-lg shadow-blue-200 items-center flex-row justify-center"
          >
            <Text className="text-white font-bold text-lg mr-2">
              Mulai Hidup Sehat
            </Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
