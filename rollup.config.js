import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
// import dts from 'rollup-plugin-dts'
import pkg from './package.json' assert { type: 'json' }

const unminifiedOutputs = [
  {
    file: pkg.exports['.'].default,
    format: 'es',
  },
  {
    file: pkg.exports['.'].require,
    format: 'cjs',
  },
]

const minifiedOutputs = [
  {
    file: pkg.exports['.'].default.replace('.js', '.min.js'),
    format: 'es',
    plugins: [terser()],
    sourcemap: true,
  },
  {
    file: pkg.exports['.'].require.replace('.js', '.min.js'),
    format: 'cjs',
    plugins: [terser()],
    sourcemap: true,
  },
]

// const declarationsOutputs = [
//   {
//     input: './src/types/index.d.ts',
//     file: './dist/types.d.ts',
//     format: 'esm',
//     plugins: [dts()],
//   },
// ]

export default {
  input: './src/index.ts',
  plugins: [typescript()],
  output: [...minifiedOutputs, ...unminifiedOutputs],
  external: ['react', 'use-sync-external-store/shim', '@redux-devtools/extension'],
}
