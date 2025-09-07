module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    // Regras do TypeScript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'off',
    
    // Regras gerais
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'off', // Usar a versão do TypeScript
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Regras de formatação
    'prettier/prettier': 'error',
    
    // Regras específicas do projeto
    'camelcase': ['error', { properties: 'never' }],
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    
    // Regras para APIs
    'consistent-return': 'off', // APIs podem retornar diferentes tipos
    'no-param-reassign': 'off', // Express.js modifica req/res
  },
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
    {
      files: ['src/migrations/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
