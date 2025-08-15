import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-plugin-prettier/recommended'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  },
  {
    ...prettierConfig,
    rules: {
      ...prettierConfig.rules,
      ...prettierConfig.rules
    }
  },
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  },
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'example/**']
  }
]
