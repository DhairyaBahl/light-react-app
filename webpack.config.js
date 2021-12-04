const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
    },
    resolve: {
        // sets the dir where module will be searched on import
        modules: [path.join(__dirname, 'src'), 'node_modules'],
        /*
            setting alias for react; only because of this,
            import react from 'react' works;

            because we set alias 'react' over here
        */
        alias: {
            react: path.join(__dirname, 'node_modules', 'react'),
        },
    },
    // we can also use ts-loader here for ts to js
    module: {
        rules: [{
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/,
                use: [{
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                    },
                ],
            },
        ],
    },
    plugins: [
        // this plugin is setting the start html point for the app
        new HtmlWebPackPlugin({
            template: './public/index.html',
        }),
    ],
};