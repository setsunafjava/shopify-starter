const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const babel = require('../config/babel');
const isDevelopment = process.env.NODE_ENV !== 'production';
const extraEntryFiles = isDevelopment
  ? ['react-hot-loader/patch', 'webpack-hot-middleware/client']
  : [];

const extraPlugins = isDevelopment
  ? [new webpack.HotModuleReplacementPlugin()] 
  : [];

const sourceMap = isDevelopment;

module.exports = {
  plugins: [
    ...extraPlugins,
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ],
  mode: process.env.NODE_ENV,
  target: 'web',
  devtool: 'eval',
  entry: {
    main: [
      ...extraEntryFiles,
      '@shopify/polaris/styles.css',
      path.resolve(__dirname, '../client/index.js'),
    ],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../assets/client'),
    publicPath: '/assets/client/',
    libraryTarget: 'var',
  },
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
              sourceMap,
              modules: true,
              importLoaders: 1,
              localIdentName: '[name]-[local]_[hash:base64:5]',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => autoprefixer(),
              sourceMap,
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
              sourceMap,
              modules: true,
              importLoaders: 1,
              localIdentName: '[local]',
            },
          },
        ],
      }
    ]
  },
};
