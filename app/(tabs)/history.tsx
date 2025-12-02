import { useHydrationStore } from "@/store/HydrationStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

import "../global.css";

// Helper untuk format tanggal (contoh: "Sen", "Sel")
const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function HistoryScreen() {
  const { history } = useHydrationStore();

  // MOCK DATA: Simulasi data 7 hari terakhir untuk Grafik
  // (Nantinya data ini diambil dari 'history' di store dan diolah)
  const weeklyData = [
    { value: 2100, label: "Sen", frontColor: "#82adfe" },
    { value: 1800, label: "Sel", frontColor: "#A9D6E5" }, // Kurang target
    { value: 2500, label: "Rab", frontColor: "#82adfe" },
    { value: 2800, label: "Kam", frontColor: "#82adfe" }, // Lebih target
    { value: 1500, label: "Jum", frontColor: "#A9D6E5" },
    { value: 2400, label: "Sab", frontColor: "#82adfe" },
    { value: 2000, label: "Min", frontColor: "#82adfe" },
  ];

  // Render item untuk List Log Harian
  const renderLogItem = ({ item }: { item: any }) => (
    <View className="flex-row items-center justify-between bg-white p-4 mb-3 rounded-xl border border-gray-100 shadow-sm">
      <View className="flex-row items-center">
        <View className="bg-water-bg p-2 rounded-full mr-3">
          <MaterialCommunityIcons name="water" size={20} color="#82adfe" />
        </View>
        <View>
          <Text className="font-bold text-gray-700">{item.amount} ml</Text>
          <Text className="text-gray-400 text-xs">
            {new Date(item.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
      <MaterialCommunityIcons
        name="check-circle-outline"
        size={20}
        color="#82adfe"
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-water-bg">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="px-6 pt-4 mb-6">
          <Text className="text-gray-500 font-medium text-base">Statistik</Text>
          <Text className="text-2xl font-bold text-gray-800">
            Riwayat Minum 📊
          </Text>
        </View>

        {/* Section 1: Grafik Batang (Historical Analytics) */}
        <View className="bg-white mx-6 p-4 rounded-3xl shadow-sm border border-gray-100 mb-6">
          <Text className="text-lg font-bold text-gray-700 mb-4">
            Minggu Ini
          </Text>

          <View className="items-center">
            <BarChart
              data={weeklyData}
              barWidth={22}
              noOfSections={4}
              barBorderRadius={4}
              frontColor="#82adfe"
              yAxisThickness={0}
              xAxisThickness={0}
              hideRules
              isAnimated
              height={180}
              width={280} // Sesuaikan lebar layar
              spacing={20}
              initialSpacing={10}
              yAxisTextStyle={{ color: "gray", fontSize: 10 }}
              xAxisLabelTextStyle={{ color: "gray", fontSize: 10 }}
            />
          </View>

          {/* Legend / Indikator */}
          <View className="flex-row justify-center mt-4 space-x-4">
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-water-primary mr-2" />
              <Text className="text-gray-500 text-xs">Tercapai</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-water-secondary mr-2" />
              <Text className="text-gray-500 text-xs">Belum Tercapai</Text>
            </View>
          </View>
        </View>

        {/* Section 2: Statistik Ringkas */}
        <View className="flex-row mx-6 mb-6 justify-between gap-3">
          <View className="flex-1 bg-water-primary p-4 rounded-2xl shadow-md">
            <Text className="text-white opacity-80 text-xs font-medium">
              Rata-rata
            </Text>
            <Text className="text-white text-2xl font-bold">
              2,150<Text className="text-sm">ml</Text>
            </Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-2xl border border-water-secondary shadow-sm">
            <Text className="text-gray-500 text-xs font-medium">Frekuensi</Text>
            <Text className="text-water-dark text-2xl font-bold">
              8<Text className="text-sm text-gray-400">x/hari</Text>
            </Text>
          </View>
        </View>

        {/* Section 3: Daily Log List */}
        <View className="px-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-700">
              Log Hari Ini
            </Text>
            <TouchableOpacity>
              <Text className="text-water-primary font-bold text-sm">
                Lihat Semua
              </Text>
            </TouchableOpacity>
          </View>

          {/* List Rendering */}
          {history.length > 0 ? (
            history.map((item, index) => (
              <React.Fragment key={index}>
                {renderLogItem({ item })}
              </React.Fragment>
            ))
          ) : (
            <View className="items-center py-8">
              <Text className="text-gray-400">Belum ada data hari ini.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
