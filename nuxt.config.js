// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: [
    '~/assets/css/tailwind.css'
  ],
  // Supprimez @vite-pwa/nuxt de cette ligne
  modules: ['@nuxt/eslint', '@nuxt/icon', '@nuxt/ui', '@nuxtjs/tailwindcss', '@pinia/nuxt'],
  pinia: { autoImports: ['defineStore', 'storeToRefs'] },
  runtimeConfig: {
    MONGO_URI: process.env.MONGO_URI,
  },
  routeRules: {
    '/.well-known/appspecific/com.chrome.devtools.json': { redirect: '/' }
  },
  nitro: {
    routeRules: {
      '/api/players/**': { middleware: 'auth-admin' }
    }
  }
})
