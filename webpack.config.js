const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'sourcemap',
    entry: path.resolve('./src/app.js'),
    output: {
        path: path.resolve('dist/'),
        filename: 'index.js.tsx.js.js',
    },
    target: 'web',
    module: {
        rules: [ {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: [{ loader: 'babel-loader' }]
        },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }, {
                test: /\.svg$/,
                use: [{
                        loader: 'url-loader',
                        options: {
                            // removeTags: true
                        },
                    },
                    {
                        loader: 'svgo-loader',
                        options: {
                            plugins: [{
                                    removeTitle: true
                                },
                                {
                                    convertColors: {
                                        shorthex: false
                                    }
                                },
                                {
                                    convertPathData: false
                                }
                            ]
                        }
                    }
                ],
            }
        ],
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: path.resolve('./src/index.html')
        })
    ]
}