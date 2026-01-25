import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import authEn from "@/locales/en/auth.json"
import commonEn from "@/locales/en/common.json"
import navEn from "@/locales/en/nav.json"
import authEs from "@/locales/es/auth.json"
import commonEs from "@/locales/es/common.json"
import navEs from "@/locales/es/nav.json"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: commonEn, auth: authEn, nav: navEn },
      es: { common: commonEs, auth: authEs, nav: navEs },
    },
    fallbackLng: "es",
    supportedLngs: ["es", "en"],
    load: "languageOnly",
    ns: ["common", "auth", "nav"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "fincore_lang",
      caches: ["localStorage"],
    },
  })

export { i18n }
