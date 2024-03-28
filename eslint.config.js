// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylisticJs from '@stylistic/eslint-plugin-js';

export default tseslint.config(
  {
    ignores: [
      '**/3rdparty/**/*',
      '**/*.js',
      '**/*.d.ts',
      '**/*.lit.css.ts'
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: [ '**/*.js' ],
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: [ '**/*.ts' ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: [ '**/*.js', '**/*.ts' ],
    rules: {
      'max-len': [ 'error', { code: 120 } ],
      'not-empty': 'off',
      semi: [ 'error', 'always' ],
    },
  },
  {
    plugins: { '@stylistic/js': stylisticJs },
    rules:{
      'array-bracket-spacing': [ 'error', 'always' ],
      quotes: [ 'error', 'single' ],
      indent: [
        'error',
        2,
        {
          ignoredNodes: [
            'TemplateResult *',
            'TaggedTemplateExpression *',
            'PropertyDefinition[decorators]',
          ],
        },
      ],
      'no-mixed-spaces-and-tabs': 'error',
      'no-multi-spaces': 'error',
      'object-curly-spacing': [ 'error', 'always' ],
      'space-infix-ops': 'error',
      'no-trailing-spaces': 'error',
      'keyword-spacing': [ 'error', { before: true, after: true } ],
      'comma-dangle': [ 'error', 'always-multiline' ],
      'space-before-function-paren': [
        'error',
        {
          'anonymous': 'always',
          'named': 'never',
          'asyncArrow': 'always',
        },
      ],
    },
  },
);
