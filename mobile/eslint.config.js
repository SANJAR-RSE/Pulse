// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // An HTML-escaping rule: React Native <Text> renders ' literally, and
      // Uzbek text is full of apostrophes (o'z, bo'lim, ko'rik).
      'react/no-unescaped-entities': 'off',
    },
  },
]);
