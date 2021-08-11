/**
 * @file san config
 */
const path = require('path');
const resolve = pathname => path.resolve(__dirname, pathname);

const outputDir = 'output';
module.exports = {
    outputDir,
    pages: {
        index: {
            entry: './example/index.js',
            template: './pages.template.ejs',
            filename: 'index.html'
        }
    },
    alias: {
        '@app': resolve('example/lib/App.js'),
        '@san-reactive': resolve('src')
    }
};
