'use strict';

const path = require('path');

module.exports = {
    entry: path.resolve('src/main.js'),
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist'),
        libraryTarget: 'amd'
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.json']
    },
    module: {
        loaders: [
            {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
    },
    externals: {
        lodash : 'lodash'
    }
};
