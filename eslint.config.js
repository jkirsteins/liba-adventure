import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // Ignore build output and dependencies
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  // Base recommended rules - catches common bugs
  js.configs.recommended,

  // Our game source files
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // --- Safety guardrails ---
      // These are ERRORS because they are dangerous or confusing
      'no-eval': 'error', // eval() is dangerous - never use it
      'no-implied-eval': 'error', // setTimeout("code") is sneaky eval
      'no-var': 'error', // Always use let or const, never var
      'no-delete-var': 'error', // Don't delete variables
      'no-shadow-restricted-names': 'error', // Don't name things "undefined" etc.
      'no-new-wrappers': 'error', // Don't do new String(), new Number()
      'no-octal': 'error', // Octal numbers (like 071) are confusing

      // --- Helpful warnings ---
      // These are WARNINGS to help you write better code
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Unused variables (ok if starts with _)
      'prefer-const': 'warn', // Use const when you never reassign
      'eqeqeq': ['warn', 'always'], // Use === instead of ==
      'no-empty': 'warn', // Don't leave empty {} blocks
      'no-console': 'off', // console.log is fine for learning!
    },
  },

  // Turn off formatting rules (Prettier handles formatting)
  prettier,
];
