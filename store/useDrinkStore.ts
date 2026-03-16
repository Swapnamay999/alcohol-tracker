import { create } from 'zustand';
import defaultBeverages from '../constants/beverages.json';

interface DrinkState {
  userHeight: string;
  userWeight: string;
  userAge: string;
  userSex: 'Male' | 'Female';
  drinksLogged: any[];
  presets: any[];
  setUserProfile: (height: string, weight: string, age: string, sex: 'Male' | 'Female') => void;
  addDrink: (type: string, sizeMl: number, abv: number, count: number) => void;
  
  // New Preset Management Functions
  addPreset: (newPreset: any) => void;
  updatePreset: (id: string, updatedData: any) => void;
  resetPresets: () => void;
  toastMessage: string | null;
  showToast: (message: string) => void;
}

export const useDrinkStore = create<DrinkState>()((set) => ({
  userHeight: '',
  userWeight: '',
  userAge: '',
  userSex: "Male",
  drinksLogged: [],
  presets: defaultBeverages, // Load the JSON initially
  
  setUserProfile: (height, weight, age, sex) => set({ userHeight: height, userWeight: weight, userAge: age, userSex: sex }),
  
  addDrink: (type, sizeMl, abv, count) => 
    set((state) => ({
      drinksLogged: [...state.drinksLogged, { type, sizeMl, abv, count, time: new Date().toISOString() }]
    })),

  addPreset: (newPreset) => 
    set((state) => ({ presets: [...state.presets, newPreset] })),
    
  updatePreset: (id, updatedData) => 
    set((state) => ({
      presets: state.presets.map(p => p.id === id ? { ...p, ...updatedData } : p)
    })),
    toastMessage: null,

  showToast: (message) => {
    set({ toastMessage: message });
    // Automatically hide the toast after 3 seconds
    setTimeout(() => {
      set({ toastMessage: null });
    }, 3000);
  },
    
  resetPresets: () => set({ presets: defaultBeverages }), // Restore factory defaults
}));