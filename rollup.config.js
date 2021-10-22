import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import babel from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

export default {
    input: 'index.ts',
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
            values: {
                __VERSION__: pkg.version
            },
            preventAssignment: true
        }),
        typescript({
            tsconfigOverride: {
                compilerOptions: {
                    sourceMap: true
                }
            }
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
