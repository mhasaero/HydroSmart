import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserData {
  name: string;
  weight: number;
  gender: "male" | "female" | null;
  hasOnboarded: boolean;
}

interface HydrationState {
  dailyTarget: number;
  currentIntake: number;
  history: { date: string; amount: number }[];
  userData: UserData;
  _hasHydrated: boolean;
  activityBonusAdded: boolean; // Agar tidak spam bonus
  addActivityBonus: () => void;

  addWater: (amount: number) => void;
  setTarget: (target: number) => void;
  setUserData: (data: Partial<UserData>) => void;
  resetDaily: () => void;
  calculateTarget: (weight: number, gender: "male" | "female") => number;
}

export const useHydrationStore = create<HydrationState>()(
  persist(
    (set, get) => ({
      dailyTarget: 2500,
      currentIntake: 0,
      history: [],
      userData: { name: "", weight: 0, gender: null, hasOnboarded: false },
      _hasHydrated: false,
      activityBonusAdded: false,

      addActivityBonus: () => {
        set((state) => ({
          dailyTarget: state.dailyTarget + 300, // Selalu tambah 300ml setiap dipanggil
          // activityBonusAdded: true <-- Hapus atau abaikan ini agar tidak mengunci
        }));
      },

      addWater: (amount) => {
        const { currentIntake, history } = get();
        set({
          currentIntake: currentIntake + amount,
          history: [{ date: new Date().toISOString(), amount }, ...history],
        });
      },

      setTarget: (target) => set({ dailyTarget: target }),

      setUserData: (data) =>
        set((state) => ({ userData: { ...state.userData, ...data } })),

      resetDaily: () => set({ currentIntake: 0, history: [] }),

      calculateTarget: (weight, gender) => {
        let baseTarget = weight * 35;
        if (gender === "male") baseTarget += 200;
        return Math.ceil(baseTarget / 50) * 50;
      },
    }),
    {
      name: "hydration-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Callback ini jalan saat data selesai dimuat
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
);
