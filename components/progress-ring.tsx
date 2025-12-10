import { useHydrationStore } from "@/store/HydrationStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Pressable, Text, Vibration, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  SensorType,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedSensor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";

const SIZE = 256;
const STROKE_WIDTH = 15;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CONTAINER_SIZE = SIZE * 2.5;
const WATER_SIZE = CONTAINER_SIZE;

// Component Animated untuk SVG
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedBubble = Animated.createAnimatedComponent(Circle);

// --- KOMPONEN BUBBLE SEDERHANA (FIX) ---
const Bubble = ({
  x,
  size,
  speed,
}: {
  x: number;
  size: number;
  speed: number;
}) => {
  // Kita animasikan 'cy' (posisi Y) secara langsung
  // Mulai dari bawah (WATER_SIZE) bergerak ke atas (0)
  const cyValue = useSharedValue(WATER_SIZE);

  useEffect(() => {
    cyValue.value = withRepeat(
      withTiming(0, {
        duration: speed,
        easing: Easing.linear,
      }),
      -1, // Loop selamanya
      false // Jangan reverse (biar selalu naik dari bawah)
    );
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    cy: cyValue.value,
  }));

  return (
    <AnimatedBubble
      cx={x}
      r={size}
      fill="rgba(255, 255, 255, 0.6)" // Putih agak transparan
      animatedProps={animatedProps}
    />
  );
};

const ProgressRing = ({ percentage }: { percentage: number }) => {
  const { addWater } = useHydrationStore();
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const intervalRef = useRef<number | null>(null);

  const sensor = useAnimatedSensor(SensorType.GRAVITY, {
    interval: 20,
    adjustToInterfaceOrientation: true,
  });

  const clampedPercentage = Math.min(percentage, 100);

  useEffect(() => {
    progress.value = withTiming(clampedPercentage / 100, { duration: 1000 });
  }, [clampedPercentage]);

  // LOGIC GYRO (Sesuai settingan kamu: Minus dan -x)
  useAnimatedReaction(
    () => sensor.sensor.value,
    (currentSensor) => {
      const { x, y } = currentSensor;
      if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1) return;

      const targetAngle = Math.atan2(y, -x) - Math.PI / 2;
      let delta = targetAngle - rotation.value;
      while (delta > Math.PI) delta -= 2 * Math.PI;
      while (delta < -Math.PI) delta += 2 * Math.PI;

      rotation.value = withSpring(rotation.value + delta, {
        damping: 50,
        stiffness: 100,
      });
    }
  );

  const animatedCircleProps = useAnimatedProps(() => {
    return { strokeDashoffset: CIRCUMFERENCE * (1 - progress.value) };
  });

  // LOGIC NAIK TURUN (Sesuai settingan kamu: Interpolate Negatif)
  const containerStyle = useAnimatedStyle(() => {
    const offsetEmpty = 428;
    const offsetFull = 172;

    const translateY = interpolate(
      progress.value,
      [0, 1],
      [-offsetEmpty, -offsetFull],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { rotate: `${rotation.value}rad` },
        { translateY: translateY },
      ],
    };
  });

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    Vibration.vibrate(50);
    intervalRef.current = setInterval(() => {
      addWater(10);
      Vibration.vibrate(10);
    }, 100);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
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
          style={[{ width: SIZE, height: SIZE }, pressStyle]}
          className="items-center justify-center bg-white rounded-full shadow-lg overflow-hidden relative bg-slate-50"
        >
          {/* CONTAINER AIR */}
          <Animated.View
            style={[
              {
                position: "absolute",
                width: CONTAINER_SIZE,
                height: CONTAINER_SIZE,
                top: -((CONTAINER_SIZE - SIZE) / 2),
                left: -((CONTAINER_SIZE - SIZE) / 2),
              },
              containerStyle,
            ]}
          >
            <Svg width={WATER_SIZE} height={WATER_SIZE}>
              {/* 1. GRADIENT - SAYA BALIK POSISINYA (FIX) */}
              <Defs>
                <LinearGradient id="freshWater" x1="0" y1="0" x2="0" y2="1">
                  {/* Posisi 0 (Atas) sekarang Biru Pekat */}
                  <Stop offset="0" stopColor="#0ea5e9" stopOpacity="1" />
                  {/* Posisi 1 (Bawah) sekarang Biru Terang */}
                  <Stop offset="1" stopColor="#bae6fd" stopOpacity="0.8" />
                </LinearGradient>
              </Defs>

              {/* 2. AIR FILL */}
              <Rect
                x="0"
                y="0"
                width={WATER_SIZE}
                height={WATER_SIZE}
                fill="url(#freshWater)"
              />

              {/* 3. BUBBLES (Size & Speed Random) */}
              {/* Saya tambahkan lebih banyak dan variasi posisi X */}
              <Bubble x={WATER_SIZE * 0.15} size={8} speed={3000} />
              <Bubble x={WATER_SIZE * 0.35} size={5} speed={4500} />
              <Bubble x={WATER_SIZE * 0.5} size={9} speed={2500} />
              <Bubble x={WATER_SIZE * 0.65} size={6} speed={3800} />
              <Bubble x={WATER_SIZE * 0.85} size={7} speed={3200} />
            </Svg>
          </Animated.View>

          {/* GLOSS EFFECT (KILAU KACA) */}
          <View className="absolute top-4 right-8 w-16 h-8 bg-white opacity-20 rounded-full rotate-45 pointer-events-none" />
          <View className="absolute bottom-4 left-8 w-4 h-4 bg-white opacity-10 rounded-full pointer-events-none" />

          {/* LAYER TEXT & RING */}
          <View className="absolute items-center z-10 pointer-events-none">
            <Text className="text-5xl font-bold text-water-primary shadow-sm">
              {percentage > 100 ? 100 : percentage}%
            </Text>
            <Text className="text-gray-500 mt-2 text-lg font-medium">
              Harian
            </Text>
            <MaterialCommunityIcons
              name="gesture-tap-hold"
              size={24}
              color="#82adfe"
              style={{ marginTop: 8, opacity: 0.6 }}
            />
          </View>

          <Svg
            width={SIZE}
            height={SIZE}
            className="absolute rotate-[-90deg] z-20 pointer-events-none"
          >
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#E5E7EB"
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
            />
            <AnimatedCircle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#82adfe"
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
