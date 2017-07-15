const path = require('path');

const glob = require('glob');
const Protext = require('protext').default;
console.log(Protext);

const errors = {
  'no-options': new Error('`options` MUST be provided'),
  'no-protext': new Error('Protext options MUST be provided'),
};

/**
 * Negate passed expression.
 * @param expr Expreesion to be negated
 * @return {bool} negated expression
 */
function not(expr) {
  return !expr;
}

/**
 * Validate passed options
 * @param {Object} options Options for this plugin and the [Protext](https://github.com/zhirzh/protext) package
 * @return {Error|null}
 */
function validateOption(options) {
  switch (true) {
    case not(options):
      return errors['no-options'];

    case not(options.protext):
      return errors['no-protext'];

    default:
      return null;
  }
}

/**
 * @typedef {Object} Options
 */

/**
 * Use the instance of this in the plugins array of the webpack options.
 *
 * @param {Object} options Option for `ProtextWebpackPlugin` and `Protext`.
 *
 * @example
 * const ProtextWebpackPlugin = require('protext-webpack-plugin');
 * ...
 * module.exports = {
 *   entry: './src/index.js'
 *   output: {
 *     path: __dirname + '/dist/',
 *     filename: 'index.js',
 *   },
 *   plugins: [
 *     ...
 *     new ProtextWebpackPlugin({
 *       globPatterns: ['**\/*.html'],
 *       // globDirectory: DIST_DIR,
 *       // globIgnores: ['foo.html'],
 *
 *       protext: {
 *         destination: DIST_DIR,
 *         font: path.resolve(SRC_DIR, 'fonts', 'font.ttf'),
 *
 *         // count: 2,
 *         // charsets: {
 *         //   source: 'abcd'.split(''),
 *         //   target: '1234'.split(''),
 *         // },
 *         // fontFamily: 'foo',
 *       },
 *     });
 *   ]
 * };
 */
class ProtextWebpackPlugin {
  constructor(options) {
    const err = validateOption(options);
    if (not(err === null)) {
      throw err;
    }

    this.options = options;

    this.encoder = new Protext(options.protext);
  }

  /**
   * @param {Object} compiler Default [`compiler`](https://github.com/webpack/docs/wiki/how-to-write-a-plugin#compiler-and-compilation) object webpack passes.
   */
  apply(compiler) {
    compiler.plugin('after-emit', (compilation, callback) => {
      this.normaliseOptions(compilation);

      const filepaths = this.getAllGlobFilepaths();

      filepaths.forEach(filepath => {
        this.encoder.encodeHtmlFile(filepath, filepath);
      });

      callback();
    });
  }

  /**
   * Get absolute paths of files that match passed glob pattern.
   * @param {string} globPattern
   * @return {Array<string>} Array of absolute filepaths.
   */
  getGlobFilepaths(globPattern) {
    const filenames = glob.sync(globPattern, {
      cwd: this.options.globDirectory,
      ignore: this.options.globIgnores,
    });

    const filepaths = filenames.map(filename =>
      path.resolve(this.options.globDirectory, filename),
    );

    return filepaths;
  }

  /**
   * Get absolute paths of all files that match passed glob patterns.
   * @return {Array<string>} Array of absolute filepaths.
   */
  getAllGlobFilepaths() {
    const allGlobFilepaths = this.options.globPatterns.reduce(
      (_allGlobFilepaths, globPattern) => {
        const filepaths = this.getGlobFilepaths(globPattern);

        const newFilepaths = filepaths.filter(filepath =>
          not(_allGlobFilepaths.includes(filepath)),
        );

        return _allGlobFilepaths.concat(newFilepaths);
      },
      [],
    );

    return allGlobFilepaths;
  }

  /**
   * Normalise provided options.
   * @param {Object} compilation The [`compilation`](https://github.com/webpack/docs/wiki/how-to-write-a-plugin#compiler-and-compilation) object that Webpack passed to the plugin.
   */
  normaliseOptions(compilation) {
    this.options.globDirectory =
      this.options.globDirectory || compilation.options.output.path;

    this.options.globPatterns = this.options.globPatterns || [
      '**/*.html{,.tmpl}',
    ];

    this.options.globIgnores = this.options.globIgnores || [
      'node_modules/**/*',
    ];
  }
}

module.exports = ProtextWebpackPlugin;
