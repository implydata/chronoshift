const process = require('process');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    'chronoshift': './src/index.ts'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{
          loader: 'ts-loader', options: {onlyCompileBundledFiles: true}
        }],
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },

  output: {
    path: __dirname + '/build',
    filename: '[name].js',
    libraryTarget: 'umd'
  }
};
