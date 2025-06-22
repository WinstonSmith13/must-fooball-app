// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: [
    '~/assets/css/tailwind.css'
  ],
  modules: ['@nuxt/eslint', '@nuxt/icon', '@nuxt/ui', '@nuxtjs/tailwindcss', '@vite-pwa/nuxt', '@pinia/nuxt'],
  pinia: {
    storesDirs: ['./stores/**'],
  },
   pwa: {
    registerType: 'autoUpdate',     // SW se met à jour dès qu’un nouveau build est déployé
    manifest: {
      name: 'Win',
      short_name: 'Win',
      description: 'Inscriptions et présences pour les créneaux foot',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#2563eb',
      icons: [
        { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
      ]
    },

    /* — on active le mode dev pour voir le SW en localhost — */
    devOptions: {
      enabled: true,          // Service-worker actif en `npm run dev`
      type: 'module'
    },

    /* — on injecte notre SW custom pour gérer les push — */
    injectManifest: {
      swSrc: 'src/sw.ts'
    }
  },
  runtimeConfig: {
    MONGO_URI: process.env.MONGO_URI,
  },
  router: {
    options: {
      routes: [
        {
          path: '/.well-known/appspecific/com.chrome.devtools.json',
          redirect: '/', // Redirige vers la page d'accueil ou une autre route
        },
      ],
    },
  },
  nitro: {
    routeRules: {
      '/api/players/**': { middleware: 'auth-admin' }   // protège PUT & DELETE
    }
  }
})
