import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["./app/assets/css/main.css"],
  modules: ["@nuxt/icon", "@nuxt/image", "@vueuse/nuxt", "@nuxtjs/i18n"],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    langDir: "locales",
    defaultLocale: "ru",
    detectBrowserLanguage: false,
    locales: [
      { code: "uk", iso: "uk-UA", file: "uk.json" },
      { code: "ru", iso: "ru-RU", file: "ru.json" },
      { code: "en", iso: "en-US", file: "en.json" },
    ],
  },
});
