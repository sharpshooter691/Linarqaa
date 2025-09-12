import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './locales/fr.json'
import ar from './locales/ar.json'

// Get saved language from localStorage
const getSavedLanguage = (): string => {
  try {
    const saved = localStorage.getItem('language-storage')
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed.state?.currentLanguage || 'fr'
    }
  } catch (error) {
    console.warn('Error reading saved language:', error)
  }
  return 'fr'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: fr,
      },
      ar: {
        translation: ar,
      },
    },
    lng: getSavedLanguage(), // Use saved language or default to 'fr'
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n 