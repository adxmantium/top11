var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: "./src/index.js",

    output: {
        path: path.resolve(__dirname, 'public'),
        filename: "Top11_bundle.js",
        sourceMapFilename: "Top11_bundle.map"
    },

    devtool: '#source-map', 

    module: {
        rules: [

            // resolve .css files using css-loader and style-loader modules
            {
                test: /\.scss$/, 
                use: ['style-loader', 'css-loader', 'sass-loader']
            },

            // use babel-loader to resolve any js files
            {
                test: /\.js?$/,
                exclude: /(node_modules)/,
                use: 'babel-loader',
            },
        ]
    },

    devServer: {
        contentBase: path.resolve(__dirname), // tells server where to serve content from
        compress: true, // enables gzip compression
        port: 8080, // customize port number
        stats: 'errors-only', // only shows error to console
        open: true, // opens app in new window on server start
        hot: true, // enables hot module replacement
    },
}