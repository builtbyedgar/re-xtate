import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import pkg from './package.json' assert { type: 'json' }

const minifiedOutputs = [
  {
    file: pkg.exports['.'].import,
    format: 'esm',
    plugins: [terser()]
  },
  {
    file: pkg.exports['.'].require,
    format: 'cjs',
    plugins: [terser()]
  },
]

const unminifiedOutputs = minifiedOutputs.map(({ file, ...rest }) => ({
  ...rest,
  file: file.replace('.min.', '.'),
}))

export default {
  input: 'index.ts',
  output: [...unminifiedOutputs, ...minifiedOutputs],
  plugins: [typescript()],
  external: ['react', 'use-sync-external-store'],
}
