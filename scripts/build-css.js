// @ts-check

import { glob } from 'glob';
import { compileAsync } from 'sass';
import { writeFileSync } from 'fs';
import { basename, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const build = async () => {
  const { default: stringToTemplateLiteral } = await import('string-to-template-literal');

  const files = (
    await glob('**/*.scss', {
      ignore: 'node_modules/**',
      withFileTypes: true,
    })
  )
    .map((file) => file.fullpath());

  const parentNodeModules = resolve(__dirname, '../../');

  for (const file of files) {
    const result = await compileAsync(file, {
      loadPaths: [
        'node_modules',
        ...(basename(parentNodeModules) === 'node_modules' ? [ parentNodeModules ] : []),
      ],
      sourceMap: true,
      verbose: true,
    });

    const { css } = result;

    const cssFilename = file.replace(/\.scss$/, '.css');
    writeFileSync(cssFilename, css);

    const jsFilename = file.replace(/\.scss$/, '.css.ts');

    const fileContents = `import { css } from 'lit';
export default css${stringToTemplateLiteral(css)};
`;

    writeFileSync(jsFilename, fileContents);
  }
};

build();
