import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../utils/storage';
import defaultBeverages from '../constants/beverages.json';
import { addDrinkLog, getUserDrinks, updateDrinkLogCount, clearUserDrinks, getUserPresets, saveUserPreset, deleteCustomPreset, resetEditedPresets } from '../utils/database';

interface DrinkState {
  activeUserId: number | null;
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
  loadUserPresets: (userId: number) => void;
  deletePreset: (id: string) => void;

  addPreset: (newPreset: any) => void;
  updatePreset: (id: string, updatedData: any) => void;
  resetPresets: () => void;
  showToast: (message: string) => void;
  updateDrinkCount: (time: string, newCount: number) => void;
  resetDrinks: () => void;
  hydrate: () => void;
}

export const useDrinkStore = create<DrinkState>()(
  persist(
    (set, get) => ({
      activeUserId: null,
      userName: '',
      userHeight: '',
      userWeight: '',
      userAge: '',
      userSex: 'Male',
      
      drinksLogged: [],
      presets: defaultBeverages,
      toastMessage: null,

      // Hydration: Reload SQLite data if we have an active user persisted in MMKV
      hydrate: () => {
        const state = get();
        if (state.activeUserId) {
          state.loadUserDrinks(state.activeUserId);
          state.loadUserPresets(state.activeUserId);
        }
      },

      setActiveUser: (id, name, height, weight, age, sex) => {
        set({ activeUserId: id, userName: name, userHeight: height, userWeight: weight, userAge: age, userSex: sex });
        get().loadUserDrinks(id);
        get().loadUserPresets(id);
      },

      loadUserPresets: (userId) => {
        const dbPresets = getUserPresets(userId);
        let mergedPresets = [...defaultBeverages].map(p => ({ ...p, isCustom: false }));

        dbPresets.forEach((dbP: any) => {
          const mappedPreset = {
            id: dbP.id, name: dbP.name, type: dbP.type, 
            volumeMl: dbP.volume_ml, abv: dbP.abv, icon: dbP.icon, isCustom: dbP.is_custom === 1
          };

          if (mappedPreset.isCustom) {
            mergedPresets.push(mappedPreset);
          } else {
            mergedPresets = mergedPresets.map(p => p.id === mappedPreset.id ? mappedPreset : p);
          }
        });

        set({ presets: mergedPresets });
      },

      loadUserDrinks: (userId) => {
        const history = getUserDrinks(userId);
        const formattedHistory = history.map((dbDrink: any) => ({
          type: dbDrink.type,
          sizeMl: dbDrink.volume_ml,
          abv: dbDrink.abv,
          count: dbDrink.count,
          time: dbDrink.timestamp
        }));
        set({ drinksLogged: formattedHistory });
      },

      addDrink: (type, sizeMl, abv, count) => {
        const state = get();
        if (!state.activeUserId) {
          state.showToast("Please select a user profile first!");
          return;
        }

        const timestamp = new Date().toISOString();
        addDrinkLog(state.activeUserId, type, sizeMl, abv, count, timestamp);

        set({
          drinksLogged: [...state.drinksLogged, { type, sizeMl, abv, count, time: timestamp }]
        });
      },

      addPreset: (newPreset) => {
        const state = get();
        if (!state.activeUserId) return;
        
        saveUserPreset(state.activeUserId, newPreset.id, newPreset.name, newPreset.type, newPreset.volumeMl, newPreset.abv, newPreset.icon, 1);
        set((state) => ({ presets: [...state.presets, { ...newPreset, isCustom: true }] }));
      },

      updatePreset: (id, updatedData) => {
        const state = get();
        if (!state.activeUserId) return;

        const isCustom = state.presets.find(p => p.id === id)?.isCustom ? 1 : 0;
        
        saveUserPreset(state.activeUserId, id, updatedData.name, updatedData.type, updatedData.volumeMl, updatedData.abv, updatedData.icon, isCustom);
        set((state) => ({ 
          presets: state.presets.map(p => p.id === id ? { ...p, ...updatedData, isCustom: isCustom === 1 } : p) 
        }));
      },

      deletePreset: (id) => {
        const state = get();
        if (!state.activeUserId) return;
        
        deleteCustomPreset(state.activeUserId, id);
        set((state) => ({ presets: state.presets.filter(p => p.id !== id) }));
      },

      resetPresets: () => {
        const state = get();
        if (!state.activeUserId) return;

        resetEditedPresets(state.activeUserId);
        get().loadUserPresets(state.activeUserId);
      },

      showToast: (message) => {
        set({ toastMessage: message });
        setTimeout(() => set({ toastMessage: null }), 3000);
      },

      updateDrinkCount: (time, newCount) => {
        const state = get();
        if (!state.activeUserId) return;

        updateDrinkLogCount(state.activeUserId, time, newCount);

        set({
          drinksLogged: newCount <= 0 
            ? state.drinksLogged.filter((drink) => drink.time !== time)
            : state.drinksLogged.map((drink) => 
                drink.time === time ? { ...drink, count: newCount } : drink
              )
        });
      },

      resetDrinks: () => {
        const state = get();
        if (!state.activeUserId) return;

        clearUserDrinks(state.activeUserId);
        set({ drinksLogged: [] });
      },
    }),
    {
      name: 'aerobac-active-user-storage',
      storage: createJSONStorage(() => zustandStorage),
      // We only want to persist the core user metadata in MMKV.
      // Large arrays like drinksLogged and presets should still come from SQLite.
      partialize: (state) => ({
        activeUserId: state.activeUserId,
        userName: state.userName,
        userHeight: state.userHeight,
        userWeight: state.userWeight,
        userAge: state.userAge,
        userSex: state.userSex,
      }),
    }
  )
);