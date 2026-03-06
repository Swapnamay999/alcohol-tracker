import { create } from 'zustand';
import { StateStorage, persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

// Initialize the blazing-fast MMKV instance
const storage = new MMKV();

// Create a custom storage adapter for Zustand to use MMKV
const zustandStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => storage.delete(name),
};

interface DrinkState {
  userHeight: string;
  userWeight: string;
  drinksLogged: any[];
  setUserProfile: (height: string, weight: string) => void;
  addDrink: (type: string, sizeMl: number, abv: number, count: number) => void;
}

export const useDrinkStore = create<DrinkState>()(
  persist(
    (set) => ({
      userHeight: '',
      userWeight: '',
      drinksLogged: [],
      setUserProfile: (height, weight) => set({ userHeight: height, userWeight: weight }),
      addDrink: (type, sizeMl, abv, count) => 
        set((state) => ({
          drinksLogged: [...state.drinksLogged, { type, sizeMl, abv, count, time: new Date().toISOString() }]
        })),
    }),
    {
      name: 'alcohol-tracker-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);