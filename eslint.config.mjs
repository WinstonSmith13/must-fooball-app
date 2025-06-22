import withNuxt from './.nuxt/eslint.config.mjs'
import js from '@eslint/js'
import globals from 'globals'

export default withNuxt(
  // Ajoutez ici vos configurations personnalisées
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      // Exemples de règles personnalisées
      'no-console': 'warn', // Avertit sur l'utilisation de console.log
      'no-unused-vars': 'warn', // Avertit sur les variables non utilisées
      'indent': ['error', 2], // Utilise une indentation de 2 espaces
      'quotes': ['error', 'single'], // Utilise des guillemets simples
      'semi': ['error', 'always'], // Exige un point-virgule à la fin des instructions
      'comma-dangle': ['error', 'always-multiline'], // Exige une virgule finale pour les objets et tableaux multilignes
    },
    ignores: [
      // Ajoutez ici les fichiers ou répertoires à ignorer
      'node_modules/**',
      '.nuxt/**',
      'dist/**',
      '*.config.js',
    ],
  },
  // Vous pouvez ajouter d'autres configurations ou plugins ici
  {
    plugins: {
      // Exemple d'ajout d'un plugin
      // 'my-plugin': myPlugin,
    },
  }
)
