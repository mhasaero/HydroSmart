import { useHydrationStore } from "@/store/HydrationStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

import "../global.css";

// Helper untuk label hari
const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function HistoryScreen() {
  // Ambil dailyTarget juga untuk perbandingan sukses/gagal
  const { history, dailyTarget } = useHydrationStore();

  // --- LOGIKA PENGOLAHAN DATA (MEMOIZED) ---
  const { chartData, weeklyAverage, avgFrequency } = useMemo(() => {
    const today = new Date();
    const last7Days = [];

    // 1. Generate 7 hari terakhir (dari H-6 sampai Hari Ini)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      last7Days.push(d);
    }

    let totalWeeklyIntake = 0;
    let totalWeeklyFreq = 0;

    // 2. Mapping data untuk Chart
    const data = last7Days.map((date) => {
      const dateStr = date.toDateString(); // Format: "Mon Dec 14 2025" (untuk membandingkan tanggal saja)
      
      // Filter history yang tanggalnya SAMA dengan tanggal loop saat ini
      const dayLogs = history.filter(
        (h) => new Date(h.date).toDateString() === dateStr
      );

      // Hitung total minum & frekuensi pada hari itu
      const dayTotal = dayLogs.reduce((acc, curr) => acc + curr.amount, 0);
      
      totalWeeklyIntake += dayTotal;
      totalWeeklyFreq += dayLogs.length;

      // Logika Warna (Hijau jika >= Target, Merah jika < Target)
      // Note: Menggunakan Hex code yang soft. 
      // Sukses (Hijau): #4ADE80, Gagal (Merah): #F87171, atau sesuaikan tema Biru mu.
      const isSuccess = dayTotal >= dailyTarget;
      
      return {
        value: dayTotal,
        label: days[date.getDay()],
        // Jika ingin sesuai request (Hijau/Merah):
        frontColor: isSuccess ? "#4ADE80" : "#F87171", 
        // Jika ingin tetap tema biru (Biru Tua/Biru Pucat):
        // frontColor: isSuccess ? "#82adfe" : "#A9D6E5",
        
        // Tambahan properti untuk chart
        minHeight: dayTotal > 0 ? 15 : 0,
        topLabelComponent: () => (
            <Text style={{color: 'gray', fontSize: 10, marginBottom: 6}}>
                {dayTotal > 0 ? Math.round(dayTotal/1000 * 10)/10 + 'L' : ''}
            </Text>
        )
      };
    });

    return {
      chartData: data,
      weeklyAverage: Math.round(totalWeeklyIntake / 7),
      avgFrequency: Math.round(totalWeeklyFreq / 7),
    };
  }, [history, dailyTarget]); // Update jika history/target berubah

  // Render item untuk List Log Harian (Sama seperti sebelumnya)
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

        {/* Section 1: Grafik Batang (Dinamis) */}
        <View className="bg-white mx-6 p-4 rounded-3xl shadow-sm border border-gray-100 mb-6">
          <View className="flex-row justify-between items-center mb-4">
             <Text className="text-lg font-bold text-gray-700">7 Hari Terakhir</Text>
             <Text className="text-xs text-gray-400">Target: {dailyTarget}ml</Text>
          </View>

          <View className="items-center">
            <BarChart
              data={chartData} // <--- MENGGUNAKAN DATA DINAMIS
              barWidth={22}
              noOfSections={4}
              maxValue={dailyTarget + 1000} // Supaya grafik tidak mentok atas
              barBorderRadius={4}
              yAxisThickness={0}
              xAxisThickness={0}
              hideRules
              isAnimated
              height={180}
              width={280}
              spacing={20}
              initialSpacing={10}
              yAxisTextStyle={{ color: "gray", fontSize: 10 }}
              xAxisLabelTextStyle={{ color: "gray", fontSize: 10 }}
            />
          </View>

          {/* Legend / Indikator */}
          <View className="flex-row justify-center mt-4 gap-6">
            <View className="flex-row items-center">
              {/* Warna indikator disesuaikan dengan logika di atas */}
              <View className="w-3 h-3 rounded-full bg-green-400 mr-2" />
              <Text className="text-gray-500 text-xs font-medium">Tercapai</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-red-400 mr-2" />
              <Text className="text-gray-500 text-xs font medium">Belum Tercapai</Text>
            </View>
          </View>
        </View>

        {/* Section 2: Statistik Ringkas (Dinamis) */}
        <View className="flex-row mx-6 mb-6 justify-between gap-3">
          <View className="flex-1 bg-water-primary p-4 rounded-2xl shadow-md">
            <Text className="text-white opacity-80 text-xs font-medium">
              Rata-rata
            </Text>
            <Text className="text-white text-2xl font-bold">
              {weeklyAverage}<Text className="text-sm"> ml</Text>
            </Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-2xl border border-water-secondary shadow-sm">
            <Text className="text-gray-500 text-xs font-medium">Frekuensi</Text>
            <Text className="text-water-dark text-2xl font-bold">
              {avgFrequency}<Text className="text-sm text-gray-400"> x/hari</Text>
            </Text>
          </View>
        </View>

        {/* Section 3: Daily Log List (Hari Ini) */}
        <View className="px-6">
            {/* ... (Kode bagian List Log sama seperti sebelumnya) ... */}
            <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-700">
              Log Hari Ini
            </Text>
            {/* Filter history hanya untuk hari ini agar list tidak menampilkan semua history */}
          </View>

          {history.filter(h => new Date(h.date).toDateString() === new Date().toDateString()).length > 0 ? (
            history
                .filter(h => new Date(h.date).toDateString() === new Date().toDateString())
                .reverse() // Yang terbaru di atas
                .map((item, index) => (
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