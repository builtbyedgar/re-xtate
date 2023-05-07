import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import pkg from './package.json' assert { type: 'json' }

const unminifiedOutputs = [
  {
    file: pkg.exports['.'].import.replace('.min.', '.'),
    format: 'esm',
    sourcemap: true,
  },
  {
    file: pkg.exports['.'].require.replace('.min.', '.'),
    format: 'cjs',
    sourcemap: true,
  },
]

const minifiedOutputs = [
  {
    file: pkg.exports['.'].import,
    format: 'esm',
    plugins: [terser()],
  },
  {
    file: pkg.exports['.'].require,
    format: 'cjs',
    plugins: [terser()],
  },
]

export default {
  plugins: [typescript()],
  input: './src/index.ts',
  output: [...unminifiedOutputs, ...minifiedOutputs],
  external: ['react', 'use-sync-external-store', '@redux-devtools/extension'],
}
