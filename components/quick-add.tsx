import { useHydrationStore } from "@/store/HydrationStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function QuickAdd() {
  const { addWater } = useHydrationStore();

  return (
    <View className="bg-white rounded-t-[40px] px-6 pt-8 pb-10 shadow-2xl h-full">
      <Text className="text-lg font-bold text-gray-700 mb-6 text-center">
        Tambah Minum Cepat
      </Text>
      <View className="flex-row justify-between gap-4">
        <TouchableOpacity
          onPress={() => addWater(100)}
          className="flex-1 items-center bg-water-bg p-4 rounded-2xl border border-water-secondary active:opacity-70"
        >
          <MaterialCommunityIcons name="cup-water" size={30} color="#82adfe" />
          <Text className="font-bold text-gray-600 mt-2">100ml</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => addWater(250)}
          className="flex-1 items-center bg-water-bg p-4 rounded-2xl border border-water-secondary active:opacity-70"
        >
          <MaterialCommunityIcons
            name="glass-mug-variant"
            size={30}
            color="#82adfe"
          />
          <Text className="font-bold text-gray-600 mt-2">250ml</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => addWater(500)}
          className="flex-1 items-center bg-water-bg p-4 rounded-2xl border border-water-secondary active:opacity-70"
        >
          <MaterialCommunityIcons
            name="bottle-soda-classic"
            size={30}
            color="#82adfe"
          />
          <Text className="font-bold text-gray-600 mt-2">500ml</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
