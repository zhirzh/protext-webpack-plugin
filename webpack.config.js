const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, 'src');
const BUILD_DIR = path.resolve(__dirname, 'build');

const nodeModules = fs
  .readdirSync('node_modules')
  .filter(x => x !== '.bin')
  .reduce((_nodeModules, mod) => {
    _nodeModules[mod] = `commonjs2 ${mod}`;
    return _nodeModules;
  }, {});

module.exports = {
  entry: ['babel-polyfill', path.resolve(SRC_DIR, 'index.js')],

  target: 'node',
  externals: nodeModules,

  output: {
    path: BUILD_DIR,
    filename: 'protext-webpack-plugin.js',
    libraryTarget: 'commonjs2',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: SRC_DIR,
      },
    ],
  },
};
