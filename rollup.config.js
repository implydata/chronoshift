import typescript from 'rollup-plugin-typescript';
import multiEntry, { entry } from 'rollup-plugin-multi-entry';

export default {
  entry: ['src/date-parser.ts', 'src/duration.ts', 'src/floor_shift_ceil.ts', 'src/init.ts', 'src/timezone.ts'],
  format: 'cjs',
  dest: 'build/chronoshift.js',
  moduleName: 'Chronoshift',
  plugins: [
    typescript({}),
    multiEntry()
  ]
}
