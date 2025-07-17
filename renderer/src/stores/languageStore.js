import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLanguageStore = create(
  persist(
    (set, get) => ({
      // State
      language: 'en', // default language is English

      // Actions
      setLanguage: (lang) => {
        set({ language: lang });
      },

      getLanguage: () => {
        return get().language;
      }
    }),
    {
      name: 'language-storage', // unique name for localStorage key
      partialize: (state) => ({
        language: state.language
      })
    }
  )
);

export default useLanguageStore;
