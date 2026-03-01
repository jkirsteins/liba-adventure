import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

// Custom rule: disallow em-dash characters anywhere in source (strings, comments, etc.)
const noEmDash = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow em-dash characters (\u2014). Use a regular dash (-) instead.' },
    fixable: 'code',
    messages: {
      noEmDash: 'Em-dash (\u2014) is not allowed. Use a regular dash (-) instead.',
    },
    schema: [],
  },
  create(context) {
    return {
      Program() {
        const sourceCode = context.sourceCode;
        const text = sourceCode.getText();
        const regex = /\u2014/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
          const loc = sourceCode.getLocFromIndex(match.index);
          context.report({
            loc: { start: loc, end: { line: loc.line, column: loc.column + 1 } },
            messageId: 'noEmDash',
            fix(fixer) {
              return fixer.replaceTextRange([match.index, match.index + 1], '-');
            },
          });
        }
      },
    };
  },
};

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
    linterOptions: {
      // Disallow all inline config comments (eslint-disable, eslint-enable, etc.)
      noInlineConfig: true,
    },
    plugins: {
      custom: { rules: { 'no-em-dash': noEmDash } },
    },
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
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }], // Unused vars/args ok if name starts with _
      'prefer-const': 'warn', // Use const when you never reassign
      'eqeqeq': ['warn', 'always'], // Use === instead of ==
      'no-empty': 'warn', // Don't leave empty {} blocks
      'no-console': 'off', // console.log is fine for learning!
      'custom/no-em-dash': 'error', // Use regular dash (-) not em-dash
    },
  },

  // Prevent accidental top-level side effects in utility/library files.
  // main.js is the entry point so it's excluded - everything else should
  // be a pure module that only exports functions.
  {
    files: ['src/**/*.js'],
    ignores: ['src/main.js'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program > ExpressionStatement',
          message:
            'Top-level side effects are not allowed in utility modules. Wrap in a function or export instead.',
        },
      ],
    },
  },

  // Turn off formatting rules (Prettier handles formatting)
  prettier,
];
