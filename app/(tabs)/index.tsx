import { useHydrationStore } from "@/store/HydrationStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { Redirect } from "expo-router"; // Import Redirect
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ... (Kode Component ProgressRing tetap sama seperti sebelumnya) ...
const ProgressRing = ({ percentage }: { percentage: number }) => (
  <View className="items-center justify-center my-8">
    <View className="w-64 h-64 rounded-full border-[15px] border-water-secondary items-center justify-center bg-white shadow-lg">
      <Text className="text-5xl font-bold text-water-primary">
        {percentage > 100 ? 100 : percentage}%
      </Text>
      <Text className="text-gray-400 mt-2 text-lg">Harian Tercapai</Text>
    </View>
  </View>
);

export default function Dashboard() {
  const {
    currentIntake,
    dailyTarget,
    addWater,
    setTarget,
    userData,
    _hasHydrated,
  } = useHydrationStore();

  const [weatherCondition, setWeatherCondition] = useState<string>("Normal");
  const [locationName, setLocationName] = useState<string>("Mencari Lokasi...");

  // ---------------------------------------------------------
  // LOGIKA PERBAIKAN DI SINI
  // ---------------------------------------------------------

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationName("Izin Lokasi Ditolak");
        return;
      }
      // Simulasi Logic
      setLocationName("Palembang");
      setWeatherCondition("Terik");
      if (dailyTarget === 2500) setTarget(2800);
    })();
  }, []);

  // 1. Jika Data Store belum selesai dimuat dari HP (Loading)
  if (!_hasHydrated) {
    return (
      <View className="flex-1 justify-center items-center bg-water-bg">
        <ActivityIndicator size="large" color="#82adfe" />
      </View>
    );
  }

  // 2. Jika Data sudah siap, tapi User BELUM Onboarding -> Redirect otomatis
  if (!userData.hasOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  // ---------------------------------------------------------
  // JIKA LOLOS DUA CEK DI ATAS, RENDER DASHBOARD SEPERTI BIASA
  // ---------------------------------------------------------

  const percentage = Math.round((currentIntake / dailyTarget) * 100);

  return (
    <SafeAreaView className="flex-1 bg-water-bg">
      {/* ... (SISA KODE UI DASHBOARD SAMA PERSIS SEPERTI SEBELUMNYA) ... */}

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="px-6 pt-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-500 font-medium text-base">
                Halo, User
              </Text>
              <Text className="text-2xl font-bold text-gray-800">
                Stay Hydrated 💧
              </Text>
            </View>
            <View className="bg-white p-2 rounded-full shadow-sm">
              <Ionicons name="settings-outline" size={24} color="#82adfe" />
            </View>
          </View>
          {/* Smart Context Card */}
          <LinearGradient
            colors={["#82adfe", "#A9D6E5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="mt-6 p-4 rounded-2xl shadow-md"
          >
            <View className="flex-row items-center space-x-3">
              <MaterialCommunityIcons
                name="weather-sunny"
                size={32}
                color="white"
              />
              <View className="flex-1 ml-3">
                <Text className="text-white font-bold text-lg">
                  {locationName}: {weatherCondition}
                </Text>
                <Text className="text-white opacity-90 text-sm mt-1">
                  Cuaca panas terdeteksi. Target harian disesuaikan (+300ml).
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Progress Ring */}
        <ProgressRing percentage={percentage} />

        <View className="items-center mb-8">
          <Text className="text-gray-500 text-lg">
            <Text className="font-bold text-water-primary text-2xl">
              {currentIntake}
            </Text>{" "}
            / {dailyTarget} ml
          </Text>
        </View>

        {/* Quick Add Buttons */}
        <View className="bg-white rounded-t-[40px] px-6 pt-8 pb-10 shadow-2xl h-full">
          <Text className="text-lg font-bold text-gray-700 mb-6 text-center">
            Tambah Minum Cepat
          </Text>
          <View className="flex-row justify-between gap-4">
            <TouchableOpacity
              onPress={() => addWater(100)}
              className="flex-1 items-center bg-water-bg p-4 rounded-2xl border border-water-secondary"
            >
              <Text className="font-bold text-gray-600">100ml</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => addWater(250)}
              className="flex-1 items-center bg-water-bg p-4 rounded-2xl border border-water-secondary"
            >
              <Text className="font-bold text-gray-600">250ml</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => addWater(500)}
              className="flex-1 items-center bg-water-bg p-4 rounded-2xl border border-water-secondary"
            >
              <Text className="font-bold text-gray-600">500ml</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
