import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import frCommon from '@/i18n/fr/common.json'
import frNav from '@/i18n/fr/nav.json'
import frStatuses from '@/i18n/fr/statuses.json'
import frForms from '@/i18n/fr/forms.json'
import frPages from '@/i18n/fr/pages.json'
import enCommon from '@/i18n/en/common.json'
import enNav from '@/i18n/en/nav.json'
import enStatuses from '@/i18n/en/statuses.json'
import enForms from '@/i18n/en/forms.json'
import enPages from '@/i18n/en/pages.json'

export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

const resources = {
  fr: {
    common: frCommon,
    nav: frNav,
    statuses: frStatuses,
    forms: frForms,
    pages: frPages,
  },
  en: {
    common: enCommon,
    nav: enNav,
    statuses: enStatuses,
    forms: enForms,
    pages: enPages,
  },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: 'common',
    ns: ['common', 'nav', 'statuses', 'forms', 'pages'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'bigdil-lang',
      caches: ['localStorage'],
    },
  })

export function getIntlLocale(): string {
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'fr'
  return lang.startsWith('en') ? 'en-GB' : 'fr-FR'
}

export default i18n
