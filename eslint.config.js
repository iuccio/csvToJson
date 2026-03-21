const js = require('@eslint/js');
const jsdocPlugin = require('eslint-plugin-jsdoc');

const jsdocRules = {
  'jsdoc/check-alignment': 'error',
  'jsdoc/check-param-names': 'error',
  'jsdoc/check-tag-names': 'error',
  'jsdoc/check-types': 'warn',
  'jsdoc/no-undefined-types': 'warn',
  'jsdoc/require-description': 'warn',
  'jsdoc/require-param': 'error',
  'jsdoc/require-returns': 'error',
  'jsdoc/require-jsdoc': [
    'warn',
    {
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: false,
        ArrowFunctionExpression: false,
        FunctionExpression: false,
      },
    },
  ],
};

const sharedGlobals = {
  // Node.js globals
  console: 'readonly',
  process: 'readonly',
  Buffer: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  global: 'readonly',
  clearInterval: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  setTimeout: 'readonly',
  // Browser globals
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  location: 'readonly',
  fetch: 'readonly',
  XMLHttpRequest: 'readonly',
  Blob: 'readonly',
  File: 'readonly',
  FileReader: 'readonly',
  // Jest globals
  describe: 'readonly',
  it: 'readonly',
  expect: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
  test: 'readonly',
  jest: 'readonly',
};

module.exports = [
  {
    ignores: ['node_modules', 'coverage', 'docs', '.eslintignore', 'demo'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'commonjs',
      globals: sharedGlobals,
    },
    plugins: {
      jsdoc: jsdocPlugin,
    },
    settings: {
      jsdoc: {
        tagNamePreference: {
          category: 'category'
        }
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      ...jsdocPlugin.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      ...jsdocRules,
      'no-mixed-spaces-and-tabs': 'off',
      'no-prototype-builtins': 'off',
    },
  },
  {
    files: ['jest.config.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'commonjs',
      globals: sharedGlobals,
    },
    rules: {
      'jsdoc/require-jsdoc': 'off',
    },
  },
  {
    files: ['test/**/*.js', 'test/**/*.spec.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'commonjs',
      globals: sharedGlobals,
    },
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'no-unused-vars': 'off',
    },
  },
];

