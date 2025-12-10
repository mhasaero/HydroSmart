import { useHydrationStore } from "@/store/HydrationStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Accelerometer } from "expo-sensors";
import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const THRESHOLD = 1.2;
const GOAL_POINTS = 100;

export default function ActivityDetector() {
  const { addActivityBonus } = useHydrationStore();

  const [intensity, setIntensity] = useState(0);
  const [points, setPoints] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false); // State untuk jeda reset

  const barWidth = useSharedValue(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      // Jika sedang Cooldown (istirahat setelah sukses), abaikan sensor
      if (isCooldown) return;

      const totalForce = Math.sqrt(x * x + y * y + z * z);
      const movement = Math.abs(totalForce - 1);

      setIntensity(movement);

      if (movement > 0.5) {
        setPoints((prev) => {
          const newPoints = prev + 1;

          // Update animasi bar
          barWidth.value = withSpring((newPoints / GOAL_POINTS) * 100);

          // TRIGGER SUKSES
          if (newPoints >= GOAL_POINTS) {
            handleSuccess(); // Panggil fungsi reset
            return GOAL_POINTS; // Mentok di 100 dulu
          }
          return newPoints;
        });
      } else {
        // Decay (Turun pelan-pelan kalau diam)
        setPoints((prev) => Math.max(0, prev - 0.5));
        barWidth.value = withTiming(
          (Math.max(0, points - 0.5) / GOAL_POINTS) * 100
        );
      }
    });

    return () => subscription && subscription.remove();
  }, [isCooldown, points]); // Tambahkan isCooldown ke dependency

  const handleSuccess = () => {
    // 1. Matikan sensor sementara
    setIsCooldown(true);
    setIntensity(0);

    // 2. Tambah Bonus Air
    addActivityBonus();

    // 3. Beri Notifikasi (Optional: Bisa ganti Toast biar ga ganggu)
    Alert.alert(
      "🏃‍♂️ Aktivitas Selesai!",
      "Target aktivitas tercapai. +300ml ditambahkan. Sensor akan di-reset dalam 3 detik.",
      [{ text: "Oke" }]
    );

    // 4. Reset Otomatis setelah 3 detik
    setTimeout(() => {
      // Reset Value
      setPoints(0);
      barWidth.value = withTiming(0, { duration: 1000 }); // Animasi mundur bar ke 0

      // Nyalakan sensor lagi
      setIsCooldown(false);
    }, 3000);
  };

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
    // Ubah warna bar jadi Hijau saat cooldown (sukses), Orange saat proses
    backgroundColor: isCooldown ? "#22c55e" : "#f97316",
  }));

  return (
    <View className="mx-6 mt-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center space-x-2">
          {/* Ganti Icon saat Cooldown */}
          <MaterialCommunityIcons
            name={isCooldown ? "check-circle" : "run-fast"}
            size={20}
            color={
              isCooldown ? "#22c55e" : intensity > 0.5 ? "#ef4444" : "#94a3b8"
            }
          />
          <Text className="text-gray-600 font-medium">
            {isCooldown ? "Target Tercapai!" : "Deteksi Aktivitas"}
          </Text>
        </View>
        <Text className="text-xs text-gray-400">
          {/* Tampilkan teks Reset saat cooldown */}
          {isCooldown
            ? "Resetting..."
            : `${Math.round(points)} / ${GOAL_POINTS} Pts`}
        </Text>
      </View>

      {/* Progress Bar Container */}
      <View className="h-3 bg-gray-100 rounded-full overflow-hidden w-full">
        {/* Animated Fill */}
        <Animated.View
          className="h-full rounded-full"
          style={animatedBarStyle}
        />
      </View>

      <Text className="text-[10px] text-gray-400 mt-2 text-center">
        {isCooldown
          ? "Istirahat sejenak sebelum mendeteksi lagi..."
          : intensity > 0.5
            ? "🔥 Sedang mendeteksi gerakan intens..."
            : "Bergeraklah untuk meningkatkan target air."}
      </Text>
    </View>
  );
}
