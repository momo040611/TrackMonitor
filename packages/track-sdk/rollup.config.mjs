import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

/**
 * Rollup config for tracking SDK
 * - input: src/index.ts
 * - output: dist/index.esm.js (ESM) & dist/index.cjs.js (CommonJS)
 * - TS 目标与项目保持一致：ES2020
 */

const inputFile = 'src/index.ts'

/** @type {import('rollup').RollupOptions[]} */
const config = [
  // ESM 构建
  {
    input: inputFile,
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' }), terser()],
  },
  // CJS 构建
  {
    input: inputFile,
    output: {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' }), terser()],
  },
]

export default config
