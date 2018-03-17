export default {
  input: 'build/index.js',
  output: {
    file: 'build/chronoshift.js',
    format: 'cjs'
  },
  external: [
    'immutable-class',
    'moment-timezone'
  ]
};
