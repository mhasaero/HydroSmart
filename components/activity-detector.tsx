import { useHydrationStore } from "@/store/HydrationStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Accelerometer } from "expo-sensors";
import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

// Ganti Text biasa dengan Animated.Text agar bisa baca value tanpa re-render
// (Kita gunakan trik TextInput editable=false nanti atau simplifikasi update text)
// Untuk simplifikasi, kita update text Points hanya setiap 5 poin agar ringan.

const GOAL_POINTS = 100;

export default function ActivityDetector() {
  const { addActivityBonus } = useHydrationStore();

  // State React (Hanya untuk UI statis / status akhir)
  const [isCooldown, setIsCooldown] = useState(false);
  const [displayPoints, setDisplayPoints] = useState(0); // Update ini dibatasi (Throttled)

  // State Reanimated (Langsung di UI Thread - Sangat Cepat)
  const pointsSV = useSharedValue(0);
  const barWidth = useSharedValue(0);

  useEffect(() => {
    // 1. Perlambat sedikit interval sensor (200ms = 5x sedetik cukup untuk deteksi lari)
    // Sebelumnya 100ms terlalu agresif
    Accelerometer.setUpdateInterval(200);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      if (isCooldown) return;

      // Hitung Guncangan
      const totalForce = Math.sqrt(x * x + y * y + z * z);
      const movement = Math.abs(totalForce - 1);

      // LOGIKA DI UI THREAD (Tanpa membebani React)
      if (movement > 0.5) {
        const newPoints = pointsSV.value + 2; // +2 karena interval lebih lambat
        pointsSV.value = newPoints;

        // Update animasi bar langsung (Tanpa re-render React)
        barWidth.value = withSpring(
          (Math.min(newPoints, GOAL_POINTS) / GOAL_POINTS) * 100
        );

        // Update Text di layar (Hanya update React State jika kelipatan 5 atau selesai)
        // Ini kuncinya agar tidak berat!
        if (Math.floor(newPoints) % 5 === 0 || newPoints >= GOAL_POINTS) {
          runOnJS(updateDisplayPoints)(newPoints);
        }

        // Cek Sukses
        if (newPoints >= GOAL_POINTS) {
          runOnJS(triggerSuccess)();
        }
      } else {
        // Decay (Turun pelan)
        if (pointsSV.value > 0) {
          pointsSV.value = Math.max(0, pointsSV.value - 0.5);
          barWidth.value = withTiming((pointsSV.value / GOAL_POINTS) * 100);

          // Sinkronisasi tampilan teks sesekali saat turun
          if (Math.floor(pointsSV.value) % 10 === 0) {
            runOnJS(updateDisplayPoints)(pointsSV.value);
          }
        }
      }
    });

    return () => subscription && subscription.remove();
  }, [isCooldown]);

  // Wrapper untuk update state React (Dipanggil via runOnJS)
  const updateDisplayPoints = (val: number) => {
    setDisplayPoints(Math.min(Math.floor(val), GOAL_POINTS));
  };

  const triggerSuccess = () => {
    setIsCooldown(true);
    addActivityBonus();

    Alert.alert("🏃‍♂️ Target Tercapai!", "+300ml ditambahkan!");

    setTimeout(() => {
      pointsSV.value = 0;
      barWidth.value = withTiming(0);
      setDisplayPoints(0);
      setIsCooldown(false);
    }, 3000);
  };

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
    backgroundColor: isCooldown ? "#22c55e" : "#f97316",
  }));

  return (
    <View className="mx-6 mt-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center space-x-2">
          <MaterialCommunityIcons
            name={isCooldown ? "check-circle" : "run-fast"}
            size={20}
            color={isCooldown ? "#22c55e" : "#ef4444"}
          />
          <Text className="text-gray-600 font-medium">
            {isCooldown ? "Target Tercapai!" : "Deteksi Aktivitas"}
          </Text>
        </View>
        <Text className="text-xs text-gray-400">
          {isCooldown
            ? "Resetting..."
            : `${displayPoints} / ${GOAL_POINTS} Pts`}
        </Text>
      </View>

      <View className="h-3 bg-gray-100 rounded-full overflow-hidden w-full">
        <Animated.View
          className="h-full rounded-full"
          style={animatedBarStyle}
        />
      </View>
    </View>
  );
}
