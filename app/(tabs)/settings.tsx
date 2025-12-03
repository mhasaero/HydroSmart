import { useHydrationStore } from "@/store/HydrationStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
  const { currentIntake, addWater } = useHydrationStore();

  const handleReset = () => {
    Alert.alert(
      "Reset Data Minum",
      "Apakah Anda yakin ingin menghapus data minum hari ini menjadi 0?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Ya, Reset",
          style: "destructive",
          onPress: () => {
            // Karena tidak ada fungsi reset eksplisit, kita kurangi jumlah saat ini
            addWater(-currentIntake);
            Alert.alert("Sukses", "Data minum berhasil direset.");
            router.push("/");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-water-bg">
      <ScrollView>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
          >
            <Ionicons name="arrow-back" size={24} color="#4A5568" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800 ml-4">
            Pengaturan
          </Text>
        </View>

        {/* Content */}
        <View className="px-6 mt-4 space-y-6">
          {/* Section: Profil */}
          <View>
            <Text className="text-gray-500 font-medium mb-3 uppercase text-xs tracking-wider">
              Profil Pengguna
            </Text>
            <View className="bg-white p-4 rounded-2xl shadow-sm">
              <View className="flex-row items-center space-x-3 mb-2">
                <View className="w-10 h-10 bg-water-secondary rounded-full items-center justify-center">
                  <Ionicons name="person" size={20} color="#82adfe" />
                </View>
                <View>
                  <Text className="text-gray-800 font-bold text-lg">
                    Syafik
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    Target Harian: 1000 ml
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Section: Data & Aksi */}
          <View>
            <Text className="text-gray-500 font-medium mb-3 uppercase text-xs tracking-wider">
              Data & Aksi
            </Text>

            <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <TouchableOpacity
                onPress={handleReset}
                className="flex-row items-center justify-between p-4 active:bg-gray-50"
              >
                <View className="flex-row items-center space-x-3">
                  <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center">
                    <MaterialCommunityIcons
                      name="restart"
                      size={18}
                      color="#EF4444"
                    />
                  </View>
                  <Text className="text-red-500 font-semibold text-base">
                    Reset Minum Hari Ini
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-400 text-xs mt-2 px-2">
              Tindakan ini akan mengembalikan jumlah air yang diminum hari ini
              menjadi 0 ml.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
