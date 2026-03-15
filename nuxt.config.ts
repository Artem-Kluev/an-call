import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["./app/assets/css/main.css"],
  modules: ["@nuxt/icon", "@nuxt/image", "@vueuse/nuxt", "@nuxtjs/i18n", "@nuxt/ui", "@nuxtjs/supabase"],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    langDir: "locales",
    defaultLocale: "uk",
    detectBrowserLanguage: false,
    locales: [
      { code: "uk", iso: "uk-UA", file: "uk.json", label: "Українська", icon: "i-twemoji-flag-ukraine" },
      { code: "ru", iso: "ru-RU", file: "ru.json", label: "Русский", icon: "i-twemoji-flag-russia" },
      { code: "en", iso: "en-US", file: "en.json", label: "English", icon: "i-twemoji-flag-united-states" },
    ],
  },
  ui: {},
  supabase: {
    redirect: false,
  },
});
