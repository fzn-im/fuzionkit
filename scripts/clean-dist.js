// @ts-check

import { glob } from 'glob';
import { unlink } from 'fs';

const build = async () => {
  const files = [
    ...await glob('src/**/*.{d.ts,js,js.map,css,css.d.ts,css.js,css.js.map,css.map,css.ts}', {
      ignore: [
        'src/global.d.ts'
      ],
      withFileTypes: true,
    }),
    ...await glob('lib/**/*', { withFileTypes: true }),
  ]
    .map((file) => file.fullpath());

  for (const file of files) {
    unlink(file, () => {});
  }
};

build();
