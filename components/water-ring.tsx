import React from "react";
import { View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SensorType,
  useAnimatedSensor,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

// Tipe Props
interface WaterRingProps {
  progress: number; // 0.0 sampai 1.0 (Contoh: 0.5 untuk 50%)
  size?: number;
  color?: string;
}

const WaterRing: React.FC<WaterRingProps> = ({
  progress,
  size = 200,
  color = "#38bdf8", // Sky-400 default
}) => {
  // 1. Mengambil data sensor GRAVITY (X, Y, Z)
  // SensorType.GRAVITY lebih stabil untuk water level daripada GYROSCOPE
  const sensor = useAnimatedSensor(SensorType.GRAVITY, { interval: 20 });

  // 2. Animasi Rotasi Air (Agar selalu horizontal)
  const animatedStyle = useAnimatedStyle(() => {
    // Mengambil nilai X dan Y dari sensor
    const { x, y } = sensor.sensor.value;

    // Menghitung sudut kemiringan ponsel (Math.atan2)
    // Kita kurangi Math.PI / 2 agar orientasi sesuai mode Portrait
    const angle = Math.atan2(y, x) - Math.PI / 2;

    // Menghitung ketinggian air berdasarkan progress
    // Jika 0%, translateY turun (positif). Jika 100%, translateY naik (negatif/0)
    // Offset ekstra biar air benar-benar hilang saat 0% dan penuh saat 100%
    const translateRange = size * 1.5;
    const translateY = interpolate(
      progress,
      [0, 1],
      [translateRange / 2, -translateRange / 2],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { rotate: withSpring(`${angle}rad`, { damping: 20, stiffness: 100 }) },
        { translateY: withTiming(translateY, { duration: 1000 }) },
      ],
    };
  });

  return (
    // Container Lingkaran (Masking)
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="bg-gray-200 overflow-hidden border-4 border-gray-300 items-center justify-center relative"
    >
      {/* Background saat kosong (opsional) */}
      <View className="absolute w-full h-full bg-slate-100" />

      {/* Layer Air */}
      <Animated.View
        style={[
          {
            width: size * 2.5, // Harus jauh lebih besar dari container agar tidak bocor saat miring
            height: size * 2.5,
            backgroundColor: color,
            position: "absolute",
            top: size / 2, // Posisi awal di tengah
          },
          animatedStyle,
        ]}
      />

      {/* Indikator Teks Persentase (Overlay) */}
      <View className="absolute z-10">
        {/* Kamu bisa ganti Text biasa dengan Text NativeWind kamu */}
      </View>
    </View>
  );
};

export default WaterRing;
