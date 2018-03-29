const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const babel = require('../config/babel');
const { NODE_ENV } = require('../config/env');
const isDev = NODE_ENV === 'development';

module.exports = {
  name: 'app',
  entry: {
    main: [
      ...(isDev ? ['react-hot-loader/patch', 'webpack-hot-middleware/client?name=app'] : []),
      '@shopify/polaris/styles.css',
      path.resolve(__dirname, '../client/app/index.js'),
    ],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../assets/app'),
    publicPath: '/assets/app/',
    libraryTarget: 'var',
  },
  mode: NODE_ENV,
  target: 'web',
  devtool: 'eval',
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options : Object.assign({}, babel, {babelrc: false})
        }
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
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, '../node_modules/@shopify/polaris'),
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
              localIdentName: '[local]',
            },
          },
        ],
      }
    ]
  },
  plugins: [
    ...(isDev ? [new webpack.HotModuleReplacementPlugin()] : []),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    }),
  ],
}