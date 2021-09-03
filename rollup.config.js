import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

export default {
    input: 'index.js',
    output: [
        {
            file: 'dist/index.cjs.js',
            format: 'cjs'
        },
        {
            file: 'dist/index.esm.js',
            format: 'esm'
        },
        {
            file: 'dist/index.umd.js',
            name: 'sca',
            // globals: {
            //     'san': 'san'
            // },
            format: 'umd'
        }
    ],
    plugins: [
        resolve({
            customResolveOptions: {
                moduleDirectory: 'node_modules'
            }
        }),
        babel({
            babelHelpers: 'bundled'
        })
    ],
    external: ['san']
};
