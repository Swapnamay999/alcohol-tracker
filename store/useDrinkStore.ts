import { create } from 'zustand';
import defaultBeverages from '../constants/beverages.json';
import { addDrinkLog, getUserDrinks } from '../utils/database';

interface DrinkState {
  activeUserId: number | null; // Tracks the currently selected user in the DB
  userName: string;
  userHeight: string;
  userWeight: string;
  userAge: string;
  userSex: 'Male' | 'Female';
  
  drinksLogged: any[];
  presets: any[];
  toastMessage: string | null;

  // Actions
  setActiveUser: (id: number, name: string, height: string, weight: string, age: string, sex: 'Male' | 'Female') => void;
  loadUserDrinks: (userId: number) => void;
  addDrink: (type: string, sizeMl: number, abv: number, count: number) => void;
  
  addPreset: (newPreset: any) => void;
  updatePreset: (id: string, updatedData: any) => void;
  resetPresets: () => void;
  showToast: (message: string) => void;
}

export const useDrinkStore = create<DrinkState>()((set, get) => ({
  activeUserId: null,
  userName: '',
  userHeight: '',
  userWeight: '',
  userAge: '',
  userSex: 'Male',
  
  drinksLogged: [],
  presets: defaultBeverages,
  toastMessage: null,

  // Loads a profile and fetches their specific drink history from SQLite
  setActiveUser: (id, name, height, weight, age, sex) => {
    set({ activeUserId: id, userName: name, userHeight: height, userWeight: weight, userAge: age, userSex: sex });
    get().loadUserDrinks(id);
  },

  // Pulls history from SQLite into the active UI state
  loadUserDrinks: (userId) => {
    const history = getUserDrinks(userId);
    // Map DB columns back to your UI state structure
    const formattedHistory = history.map((dbDrink: any) => ({
      type: dbDrink.type,
      sizeMl: dbDrink.volume_ml,
      abv: dbDrink.abv,
      count: dbDrink.count,
      time: dbDrink.timestamp
    }));
    set({ drinksLogged: formattedHistory });
  },

  // Updates UI state AND writes to SQLite permanently
  addDrink: (type, sizeMl, abv, count) => {
    const state = get();
    if (!state.activeUserId) {
      state.showToast("Please select a user profile first!");
      return;
    }

    const timestamp = new Date().toISOString();
    
    // 1. Save to SQLite
    addDrinkLog(state.activeUserId, type, sizeMl, abv, count, timestamp);

    // 2. Update active UI state
    set({
      drinksLogged: [...state.drinksLogged, { type, sizeMl, abv, count, time: timestamp }]
    });
  },

  addPreset: (newPreset) => set((state) => ({ presets: [...state.presets, newPreset] })),
  updatePreset: (id, updatedData) => set((state) => ({ presets: state.presets.map(p => p.id === id ? { ...p, ...updatedData } : p) })),
  resetPresets: () => set({ presets: defaultBeverages }),
  
  showToast: (message) => {
    set({ toastMessage: message });
    setTimeout(() => set({ toastMessage: null }), 3000);
  },
}));