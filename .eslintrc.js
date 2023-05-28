module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:lit/recommended',
  ],
  ignorePatterns: [
    'libs',
    'src/js/modules/janus/janus.es.*',
    '**/3rdparty/**/*',
    '**/node_modules/**/*',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'import-newlines',
    'lit',
  ],
  globals: {
    cast: true,
    escapeHTML: true,
    TemplateResult: true,
  },
  rules: {
    'array-bracket-spacing': [ 'error', 'always' ],
    'comma-dangle': [ 'error', 'always-multiline' ],
    'eol-last': [ 'error', 'always' ],
    'import-newlines/enforce': [
      'error',
      {
        'max-len': 120,
        semi: false,
      },
    ],
    'import/no-duplicates': 'off',
    'import/no-webpack-loader-syntax': 'off',
    indent: [
      'error',
      2,
      { ignoredNodes: [ 'TemplateResult *', 'TaggedTemplateExpression *', 'PropertyDefinition[decorators]' ] },
    ],
    'max-len': [ 'error', { code: 120 } ],
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'object-curly-spacing': [ 'error', 'always' ],
    quotes: 'off',
    semi: [ 'error', 'always' ],
    'no-empty': 'off',
  },
  overrides: [
    {
      files: [ 'webpack.config.js', '.eslintrc.js', 'webpack/**/*' ],
      globals: {
        __dirname: true,
        require: true,
        module: true,
      },
      rules: {
      },
    },
    {
      files: [ '**/*.ts' ],
      extends: [
        'plugin:@typescript-eslint/recommended',
      ],
      globals: {
        __dirname: true,
        require: true,
        module: true,
      },
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/no-unused-vars': [ 'error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' } ],
        '@typescript-eslint/quotes': [ 'error', 'single' ],
      },
    },
  ],
};
