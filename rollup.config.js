export default {
  entry: 'build/index.js',
  format: 'cjs',
  dest: 'build/chronoshift.js',
  external: [
    'immutable-class',
    'walltime-repack'
  ]
};
