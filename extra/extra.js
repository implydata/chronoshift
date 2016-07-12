/*
 * Copyright 2014-2015 Metamarkets Group Inc.
 * Copyright 2015-2016 Imply Data, Inc.
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

var fs = require('fs');

var defs = './build/chronoshift.d.ts';
try {
  var fileData = fs.readFileSync(defs, 'utf8');
} catch (e) {
  process.exit(0);
}

// Delete:
// declare function require(file: string): any;
fileData = fileData.replace('declare function require(file: string): any;\n', '');

// Ensure it was deleted
if (fileData.indexOf('declare function require') !== -1) {
  throw new Error("failed to delete require declaration");
}

// Delete:
// declare var module: {
//   exports: any;
// };
fileData = fileData.replace(/declare var module: \{\s*exports: any;\s*\};\n/, '');

// Ensure it was deleted
if (fileData.indexOf('declare var module') !== -1) {
  throw new Error("failed to delete require declaration");
}

// Add the extra export code
fileData += [
  '',
  'declare var chronoshift: typeof Chronoshift;',
  'declare module "chronoshift" {',
  '    export = chronoshift;',
  '}'
].join('\n');

fs.writeFileSync(defs, fileData, 'utf8');
