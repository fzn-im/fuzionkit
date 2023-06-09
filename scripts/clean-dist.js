const { glob } = require('glob');
const fs = require('fs');

const build = async () => {
  const { default: stringToTemplateLiteral } = await import('string-to-template-literal');

  const files = (
    await glob('*/**/*.{d.ts,js,js.map,lit.css,lit.css.d.ts,lit.css.js,lit.css.js.map,lit.css.map,lit.css.ts}', {
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
