const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const babel = require('../config/babel')
const { NODE_ENV } = process.env
const isDev = NODE_ENV === 'development'
const ExtractTextPlugin = require("extract-text-webpack-plugin")
module.exports = {
  name: 'script',
  entry: {
    main: [
      path.resolve(__dirname, '../client/app/script-tag/index.js')
    ],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../assets/app/script-tag'),
    publicPath: '/asssets/app/script-tag/',
    libraryTarget: 'var'
  },
  mode: NODE_ENV,
  target: 'web',
  devtool: 'eval',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options : Object.assign({}, babel, {babelrc: false})
        }
      }, {
       test: /\.css$/,
        exclude: /client/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDev,
              modules: true,
              importLoaders: 1,
              localIdentName: '[name]-[local]_[hash:base64:5]',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => autoprefixer(),
              sourceMap: isDev,
            },
          },
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    }),
    new CopyWebpackPlugin([{ 
      from: path.resolve(__dirname, '../client/app/proxy'), 
      to: path.resolve(__dirname, '../assets/app/proxy')
    }]),
    new ExtractTextPlugin({
      filename: 'assets/all.bundle.css',
      allChunks: true
    }),
  ],
}