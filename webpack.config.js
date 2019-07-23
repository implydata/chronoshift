/*
 * Copyright 2015-2019 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const process = require('process');

function friendlyErrorFormatter(e) {
  return `${e.severity}: ${e.content} [TS${e.code}]\n    at (${e.file}:${e.line}:${e.character})`;
}

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    chronoshift: './src/index.ts',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              errorFormatter: friendlyErrorFormatter,
              onlyCompileBundledFiles: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },

  output: {
    path: __dirname + '/build',
    filename: '[name].js',
    libraryTarget: 'umd',
  },
};
