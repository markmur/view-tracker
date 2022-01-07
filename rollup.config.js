import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import filesize from 'rollup-plugin-filesize'

import pkg from './package.json'

// Abort if NODE_ENV hasn't been specified
if (process.env.NODE_ENV !== 'production') {
  throw new Error('`NODE_ENV` must be production to build.')
}

/**
 * Get the dependencies from a particular object in the package.
 * i.e getDependencies('peerDependencies')
 * @param  {String} key - the package key
 * @return {Array} Returns array of keys, defaults to empty array
 */
const getDependencies = key => (key in pkg ? Object.keys(pkg[key]) : [])

/**
 * List of unique peerDependencies and dependencies from all packages
 * @type {Array}
 */
const dependencies = [].concat(getDependencies('peerDependencies'))

// Intentional log for dependencies
console.log('External Dependencies:', dependencies)

export default {
  input: 'src/index.js',
  output: [
    {
      format: 'es',
      file: pkg.module,
      sourcemap: true,
    },
    {
      format: 'cjs',
      file: pkg.main,
      sourcemap: true,
    },
  ],
  plugins: [resolve(), babel(), commonjs(), terser(), filesize()],
  external: dependencies,
}
