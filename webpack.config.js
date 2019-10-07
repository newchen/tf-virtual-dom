var path = require('path');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

let name = 'index';
let isMini = process.env.npm_lifecycle_event === 'mini' ? true : false;
let entryName = isMini ? `${name}.min` : `${name}`;

module.exports = {
    mode: isMini ? 'production' : 'development',

    entry: {
        [entryName]: './src/lib/index.js'
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'TfVirtualDom',
        libraryTarget: 'umd'
    },

    devServer: {
        historyApiFallback: true,
        inline: true
    },

    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                sourceMap: true ,
                uglifyOptions: { // ie8
                    ie8: true
                }
            }),
        ]
    },

    module: {
        rules: [{ 
            test: /\.js$/,
            exclude: /node_modules/,
            use: {  
                loader: 'babel-loader'
            }
        }]
    }

}

