import ProgressRing from "@/components/progress-ring";
import QuickAdd from "@/components/quick-add";
import { useHydrationStore } from "@/store/HydrationStore";
import { getWeatherByCoords } from "@/utils/weather";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { Redirect, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Dashboard() {
  const { currentIntake, dailyTarget, setTarget, userData, _hasHydrated } =
    useHydrationStore();

  const [weatherCondition, setWeatherCondition] =
    useState<string>("Memuat Cuaca...");
  const [temperature, setTemperature] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>("Mencari Lokasi...");
  const [isHotWeather, setIsHotWeather] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;

    let mounted = true;

    const fetchWeather = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (mounted) {
          setLocationName("Izin Ditolak");
          setWeatherCondition("-");
        }
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const result = await getWeatherByCoords(latitude, longitude);

      if (!mounted) return;

      if (result.isSuccess) {
        setLocationName(result.city);
        setTemperature(result.temp);

        const formattedCondition = result.condition.replace(/\b\w/g, (l) =>
          l.toUpperCase()
        );
        setWeatherCondition(formattedCondition);

        if (result.temp > 30) {
          setIsHotWeather(true);

          if (dailyTarget < 3000) {
            setTarget(dailyTarget + 300);
          }
        } else {
          setIsHotWeather(false);
        }
      } else {
        setWeatherCondition(result.message || "Error");
      }
    };

    fetchWeather();

    return () => {
      mounted = false;
    };
  }, [_hasHydrated]);

  if (!_hasHydrated) {
    return (
      <View className="flex-1 justify-center items-center bg-water-bg">
        <ActivityIndicator size="large" color="#82adfe" />
      </View>
    );
  }

  if (!userData?.hasOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  const percentage = Math.round((currentIntake / dailyTarget) * 100);

  return (
    <SafeAreaView className="flex-1 bg-water-bg">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Section */}
        <View className="px-6 pt-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-500 font-medium text-base">
                Halo, Syafik
              </Text>
              <Text className="text-2xl font-bold text-gray-800">
                Stay Hydrated 💧
              </Text>
            </View>
            <TouchableOpacity
              className="bg-white p-2 rounded-full shadow-sm"
              onPress={() => router.push("/settings")}
            >
              <Ionicons name="settings-outline" size={24} color="#82adfe" />
            </TouchableOpacity>
          </View>

          {/* Smart Context Card (Weather) */}
          <LinearGradient
            colors={
              isHotWeather ? ["#FF9966", "#FF5E62"] : ["#82adfe", "#A9D6E5"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="mt-6 p-4 rounded-2xl shadow-md"
          >
            <View className="flex-row items-center space-x-3">
              <MaterialCommunityIcons
                name={
                  isHotWeather
                    ? "weather-sunny-alert"
                    : temperature === null
                      ? "weather-cloudy-clock" // Icon loading/unknown
                      : "weather-partly-cloudy"
                }
                size={32}
                color="white"
              />
              <View className="flex-1 ml-3">
                <Text className="text-white font-bold text-lg">
                  {locationName}:{" "}
                  {temperature !== null ? `${temperature}°C` : "..."}
                </Text>
                <Text className="text-white font-medium text-base">
                  {weatherCondition}
                </Text>
                <Text className="text-white opacity-90 text-xs mt-1 leading-4">
                  {isHotWeather
                    ? "Cuaca panas ekstrem! Target air dinaikkan (+300ml)."
                    : "Cuaca mendukung. Jaga hidrasi tetap optimal!"}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Main Indicator */}
        <ProgressRing percentage={percentage} />

        <View className="items-center mb-8">
          <Text className="text-gray-500 text-lg">
            <Text className="font-bold text-water-primary text-2xl">
              {currentIntake}
            </Text>{" "}
            / {dailyTarget} ml
          </Text>
        </View>

        {/* Quick Add Actions */}
        <QuickAdd />
      </ScrollView>
    </SafeAreaView>
  );
}
