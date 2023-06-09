const { glob } = require('glob');
const sass = require('sass');
const fs = require('fs');

const build = async () => {
  const { default: stringToTemplateLiteral } = await import('string-to-template-literal');

  const files = (
    await glob('**/*.scss', {
      ignore: 'node_modules/**',
      withFileTypes: true,
    })
  )
    .map((file) => file.fullpath());

  // console.log('/* files */', files);

  for (const file of files) {
    const result = await sass.compileAsync(file, {
      loadPaths: [ 'node_modules' ],
      sourceMap: true,
      verbose: true,
    });

    // console.log('cwd', process.cwd());
    // console.log('result', result);

    const { css } = result;

    const cssFilename = file.replace(/\.scss$/, '.css');
    fs.writeFileSync(cssFilename, css);

    const jsFilename = file.replace(/\.scss$/, '.css.ts');

    const fileContents = `import { css } from 'lit';
export default css${stringToTemplateLiteral(css)};
`;

    fs.writeFileSync(jsFilename, fileContents);
  }
};

build();
