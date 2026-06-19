/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Enforce explicit return types on exported functions
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // Allow any only where absolutely necessary
    '@typescript-eslint/no-explicit-any': 'warn',
    // Unused vars — prefix with _ to suppress
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // Consistent type imports
    '@typescript-eslint/consistent-type-imports': 'warn',
    // No console in production code (allow warn/error)
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.next/',
    'coverage/',
    '*.js',
    '!.eslintrc.js',
    '!commitlint.config.js',
    '!.lintstagedrc.js',
  ],
  overrides: [
    // NestJS services
    {
      files: ['apps/*/src/**/*.ts'],
      parserOptions: {
        project: ['./apps/*/tsconfig.json'],
      },
    },
    // Next.js frontend
    {
      files: ['app/**/*.tsx', 'components/**/*.tsx'],
      extends: ['next/core-web-vitals'],
      rules: {
        'no-console': ['warn', { allow: ['warn', 'error'] }],
      },
    },
  ],
};
