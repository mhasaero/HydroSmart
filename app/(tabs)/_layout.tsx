import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css"; // Pastikan CSS tetap ter-load

export default function RootLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false, // Hilangkan header bawaan (kita pakai header custom di file index)
          tabBarActiveTintColor: "#82adfe", // Warna biru saat aktif
          tabBarInactiveTintColor: "#9ca3af", // Warna abu saat tidak aktif
          tabBarStyle: {
            height: 65,
            paddingBottom: 10,
            paddingTop: 10,
            backgroundColor: "white",
            borderTopWidth: 0,
            elevation: 10, // Shadow untuk Android
            shadowColor: "#000", // Shadow untuk iOS
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        {/* 1. Tab Dashboard (Home) */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "water" : "water-outline"}
                size={28}
                color={color}
              />
            ),
          }}
        />

        {/* 2. Tab History (Riwayat) */}
        <Tabs.Screen
          name="history"
          options={{
            title: "Riwayat",
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "chart-bar" : "chart-bar-stacked"}
                size={28}
                color={color}
              />
            ),
          }}
        />

        {/* 3. Halaman Onboarding (Disembunyikan dari Menu Bawah) */}
        <Tabs.Screen
          name="onboarding"
          options={{
            href: null, // Ini menyembunyikan tombolnya dari Tab Bar bawah
            tabBarStyle: { display: "none" }, // Ini menyembunyikan batang navigasi saat di halaman ini
            tabBarItemStyle: { display: "none" },
          }}
        />
      </Tabs>
      <StatusBar style="dark" />
    </>
  );
}
