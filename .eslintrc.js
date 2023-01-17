module.exports = {
  ...require('@blitzjs/next/eslint'),
  plugins: ['unused-imports'],
  ignorePatterns: [],
  rules: {
    'no-html-link-for-pages': 'off',
    'no-unused-vars': 'off', // or '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }
    ]
  }
};
