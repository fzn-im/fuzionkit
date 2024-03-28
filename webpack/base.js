// @ts-check

import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const modules = (
  profile,
  {
    tsconfigPath,
  } = {
    tsconfigPath: path.resolve(__dirname, '../tsconfig.webpack.json'),
  },
) => ({
  rules: [
    {
      test: /\.js$/,
      enforce: 'pre',
      use: [
        {
          loader: 'source-map-loader',
          options: {
            filterSourceMappingUrl: (_url, resourcePath) => {
              if (/tsee\//i.test(resourcePath)) {
                return false;
              }

              return true;
            },
          },
        },
      ],
    },
    {
      test: /\.(sa|sc|c)ss$/,
      oneOf: [
        {
          resourceQuery: /lit/,
          use: [
            { loader: 'lit-scss-loader', options: { minify: false } }, // profile.mode !== 'development' } },
            { loader: path.resolve(__dirname, './escape-lit-scss.js') },
            {
              loader: 'extract-loader',
              options: {
                publicPath: '',
                sourceMap: true,
              },
            },
            {
              loader: 'css-loader',
              options: { sourceMap: true, esModule: false },
            },
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  includePaths: [ '.', './src', './node_modules' ],
                },
                sourceMap: true,
              },
            },
          ],
        },
        {
          use: [
            { loader: MiniCssExtractPlugin.loader }, // options: { publicPath: '/' } },
            { loader: 'css-loader', options: { sourceMap: true } },
            { loader: 'resolve-url-loader', options: { sourceMap: true } },
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  includePaths: [ '.', './src', './node_modules' ],
                },
                sourceMap: true,
              },
            },
          ],
        },
      ],
    },
    {
      test: /\.(png|jpg|gif|woff|woff2)/,
      dependency: { not: [ 'url' ] },
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 10000,
            alias: {},
            esModule: false,
          },
        },
      ],
    },
    {
      test: /\.(ttf|eot|svg|otf)/,
      dependency: { not: [ 'url' ] },
      use: [
        {
          loader: 'file-loader',
          options: {
            esModule: false,
          },
        },
      ],
    },
    {
      test: /\.tsx?$/,
      // exclude: path.resolve(__dirname, './node_modules/'),
      oneOf: [
        {
          resourceQuery: /worker/,
          use: [
            {
              loader: 'worker-loader',
              options: {
                inline: 'fallback',
              },
            },
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      corejs: '3.36.0',
                      useBuiltIns: 'entry',
                    },
                  ],
                ],
                plugins: [
                  [
                    'template-html-minifier',
                    {
                      modules: {
                        lit: [ 'html' ],
                      },
                      strictCSS: true,
                      htmlMinifier: {
                        collapseWhitespace: true,
                        conservativeCollapse: true,
                        removeComments: true,
                        caseSensitive: true,
                        minifyCSS: true,
                      },
                    },
                  ],
                ],
              },
            },
            {
              loader: 'ts-loader',
              options: {
                configFile: path.resolve(__dirname, '../src/worker-js/tsconfig.json'),
              },
            },
          ],
        },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      corejs: '3.36.0',
                      useBuiltIns: 'entry',
                    },
                  ],
                ],
              },
            },
            {
              loader: 'ts-loader',
              options: {
                configFile: tsconfigPath,
              },
            },
          ],
        },
      ],
    },
    {
      test: /\.m?jsx?$/,
      // exclude: path.resolve(__dirname, '../node_modules/'),
      oneOf: [
        {
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      corejs: '3.36.0',
                      useBuiltIns: 'entry',
                    },
                  ],
                ],
                plugins: [
                  '@babel/plugin-transform-class-properties',
                ],
              },
            },
          ],
        },
        {
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      corejs: '3.36.0',
                      useBuiltIns: 'entry',
                    },
                  ],
                ],
                plugins: [
                  '@babel/plugin-transform-class-properties',
                ],
              },
            },
          ],
        },
      ],
    },
    {
      test: /\.hbs$/,
      use: [
        {
          loader: 'handlebars-loader',
          options: {
            minimize: profile.mode === 'production',
            extensions: [ 'handlebars', 'hbs', '' ],
            helperDirs: [
              path.resolve(__dirname, '../src/html/helpers/'),
            ],
          },
        },
      ],
    },
    {
      test: /\.mp3$/,
      exclude: path.resolve(__dirname, '../node_modules/'),
      loader: 'file-loader',
    },
    {
      test: /\.pug$/,
      include: path.join(__dirname, '../src'),
      loader: 'pug-loader',
    },
    {
      resourceQuery: /inline/,
      type: 'asset/inline',
    },
  ],
});

const plugins = (
  profile,
  plugins,
) => ([
  new webpack.ProvidePlugin({
    process: 'process/browser',
  }),
  new webpack.LoaderOptionsPlugin({
    minimize: profile.mode === 'production',
  }),
  ...plugins,
]);

const resolve = ({
  modules = [],
} = {}) => ({
  symlinks: false,
  modules: [
    ...modules,
    path.resolve(__dirname, '../src'),
    'node_modules',
  ],
  fallback: {
    // buffer: require.resolve('buffer/'),
    // stream: require.resolve('stream-browserify'),
    // assert: require.resolve('assert'),
  },
  extensions: [ '.js', '.jsx', '.ts', '.tsx', '.mjs' ],
});

export {
  modules,
  plugins,
  resolve,
};
