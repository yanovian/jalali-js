import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.tsx'],
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
  // "essential" (not "recommended") on purpose: the tiers above it ("strongly-recommended",
  // "recommended") are almost entirely template formatting opinions (attribute wrapping, quote
  // style, self-closing tags, and so on) that fight Prettier's own, different opinion on the
  // same things, the same problem eslint-config-prettier exists to solve for core ESLint.
  // "essential" is Vue's own correctness-only tier (deprecated APIs, invalid directives,
  // duplicate keys); the couple of non-formatting rules worth keeping from the higher tiers are
  // added back explicitly below instead.
  ...vue.configs['flat/essential'],
  {
    // Placed after vue.configs['flat/essential'] (which is not itself scoped to *.vue) so this
    // wins for max-lines-per-function, which the Vue config would otherwise re-enable for a
    // plain .test.ts file.
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      // Component names (e.g. Calendar, DatePicker) match the same name used in the React
      // binding, on purpose, for a consistent cross-framework API; that sometimes means a
      // single word, which this rule otherwise flags as a possible future native-element clash.
      'vue/multi-word-component-names': 'off',
      // Kept from the "recommended" tier despite using "essential" as the base: a real
      // security check (v-html is this project's only realistic XSS vector) and two real
      // correctness checks, none of them formatting opinions.
      'vue/no-v-html': 'error',
      'vue/require-explicit-emits': 'error',
      'vue/no-template-shadow': 'error',
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', '**/.next/**', '**/.nuxt/**'],
  },
);
