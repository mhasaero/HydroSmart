import { useHydrationStore } from "@/store/HydrationStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Pressable, Text, Vibration, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

// --- KONFIGURASI UKURAN ---
const SIZE = 256; // Lebar/Tinggi Box (w-64 = 256px)
const STROKE_WIDTH = 15;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Komponen Animated Circle agar bisa digerakkan reanimated
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressRing = ({ percentage }: { percentage: number }) => {
  const { addWater } = useHydrationStore();
  // State untuk animasi
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);
  const waveHeight = useSharedValue(0);
  const intervalRef = useRef<number | null>(null);

  // Batasi persentase visual maks 100%
  const clampedPercentage = Math.min(percentage, 100);

  // Update animasi saat percentage berubah dari luar
  useEffect(() => {
    progress.value = withTiming(clampedPercentage / 100, { duration: 1000 });
    waveHeight.value = withSpring(clampedPercentage, { damping: 20 });
  }, [clampedPercentage]);

  // Animasi Properti SVG (Lingkaran Biru)
  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  // Animasi Tinggi Air (Isi dalam lingkaran)
  const animatedWaterStyle = useAnimatedStyle(() => {
    return {
      height: `${waveHeight.value}%`,
    };
  });

  // Animasi Scale saat ditekan
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // --- LOGIKA HOLD TO ADD ---
  const handlePressIn = () => {
    // Efek visual ditekan
    scale.value = withSpring(0.95);
    Vibration.vibrate(50); // Haptic feedback awal

    // Mulai loop penambahan air
    intervalRef.current = setInterval(() => {
      addWater(10); // Tambah 10ml setiap 100ms
      Vibration.vibrate(10); // Haptic halus saat mengisi
    }, 100);
  };

  const handlePressOut = () => {
    // Kembalikan ukuran
    scale.value = withSpring(1);

    // Hentikan penambahan
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <View className="items-center justify-center my-8">
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        delayLongPress={200}
      >
        <Animated.View
          style={[{ width: SIZE, height: SIZE }, animatedContainerStyle]}
          className="items-center justify-center bg-white rounded-full shadow-lg overflow-hidden relative"
        >
          {/* 1. LAYER AIR (WAVE FILL) - Di dalam lingkaran */}
          <View className="absolute bottom-0 w-full h-full justify-end">
            {/* Background air transparan */}
            <Animated.View
              style={[animatedWaterStyle]}
              className="w-full bg-water-primary/20"
            />
          </View>

          {/* 2. LAYER TEXT & ICON */}
          <View className="absolute items-center z-10">
            <Text className="text-5xl font-bold text-water-primary">
              {percentage > 100 ? 100 : percentage}%
            </Text>
            <Text className="text-gray-400 mt-2 text-lg">Harian Tercapai</Text>
            <View className="mt-2 opacity-50">
              <MaterialCommunityIcons
                name="gesture-tap-hold"
                size={24}
                color="#82adfe"
              />
            </View>
            <Text className="text-water-secondary text-[10px]">
              Tahan untuk isi
            </Text>
          </View>

          {/* 3. LAYER SVG RING (BORDER) */}
          <Svg width={SIZE} height={SIZE} className="absolute rotate-[-90deg]">
            {/* Background Ring (Abu-abu) */}
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#E5E7EB" // gray-200
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
            />
            {/* Foreground Ring (Biru - Animasi) */}
            <AnimatedCircle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#82adfe" // water-primary
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              strokeLinecap="round"
              animatedProps={animatedCircleProps}
            />
          </Svg>
        </Animated.View>
      </Pressable>
    </View>
  );
};

export default ProgressRing;
