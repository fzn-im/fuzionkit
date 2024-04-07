// @ts-check

import tseslint from 'typescript-eslint';
import fuzionRecommended from 'fuzionkit-build/eslint/recommended.js'

export default tseslint.config(
  {
    ignores: [
      '**/3rdparty/**/*',
      '**/*.js',
      '**/*.d.ts',
      '**/*.lit.css.ts'
    ],
  },
  ...fuzionRecommended,
);
