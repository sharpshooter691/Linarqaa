import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from 'i18next'

type Language = 'fr' | 'ar'

interface LanguageState {
  currentLanguage: Language
  setLanguage: (language: Language) => void
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'fr',

      setLanguage: (language: Language) => {
        // Change i18n language first
        i18n.changeLanguage(language)
        // Then update the state
        set({ currentLanguage: language })
      },
    }),
    {
      name: 'language-storage',
      // Ensure the language is synced on hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Sync i18n with the restored language
          i18n.changeLanguage(state.currentLanguage)
        }
      },
    }
  )
) 