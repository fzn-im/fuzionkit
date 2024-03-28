// @ts-check

import { glob } from 'glob';
import { rmSync, unlink } from 'fs';

const build = async () => {
  rmSync('lib', { recursive: true, force: true });

  const files = (
    await glob('src/**/*.{d.ts,js,js.map,css,css.d.ts,css.js,css.js.map,css.map,css.ts}', {
      ignore: [
        'src/global.d.ts'
      ],
      withFileTypes: true,
    })
  )
    .map((file) => file.fullpath());

  for (const file of files) {
    unlink(file, () => {});
  }
};

build();
