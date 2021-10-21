import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import babel from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';
import pkg from "./package.json";



export default {
    input: 'index.js',
    output: [
        {
            file: 'dist/index.common.js',
            format: 'cjs',
            sourcemap: true
        },
        {
            file: 'dist/index.esm.js',
            format: 'esm',
            sourcemap: true
        },
        {
            file: 'dist/index.umd.js',
            name: 'sca',
            format: 'umd',
            sourcemap: true
        }
    ],
    plugins: [
        replace({
            __VERSION__: pkg.version
        }),
        resolve({
            customResolveOptions: {
                moduleDirectory: 'node_modules'
            }
        }),
        babel({
            babelHelpers: 'bundled'
        }),
        terser()
    ],
    external: ['san']
};
