const { glob } = require('glob');
const fs = require('fs');

const build = async () => {
  const { default: stringToTemplateLiteral } = await import('string-to-template-literal');

  const files = (
    await glob('*/**/*.{d.ts,js,js.map,css,css.d.ts,css.js,css.js.map,css.map,css.ts}', {
      ignore: [
        'node_modules/**',
        'resources/**',
        'scripts/**',
      ],
      withFileTypes: true,
    })
  )
    .map((file) => file.fullpath());

  for (const file of files) {
    fs.unlink(file, () => {});
  }
};

build();
