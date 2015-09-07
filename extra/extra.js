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
