'use strict';
const path = require('path');
const process = require('process');
const webpack = require('webpack');
const minimize = process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'beta';

const config = {
  entry: {
    'pikaday': './js/pikaday.js',
  },
  output: {
    path: path.join(__dirname, './dist'),
    filename: minimize ? '[name].js' : '[name].js',
    library: 'Pikaday',
    libraryTarget: 'umd2'
  },
  devServer: {
    contentBase: './',
    host: 'localhost',
    port: 8080,
    inline: true
  },
  resolve: {
    root: path.resolve(__dirname),
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel', // 'babel-loader' is also a valid name to reference,
      include: [
        path.resolve(__dirname, "js"),
      ],
      query: {
        plugins: ['transform-runtime'],
        presets: ['es2015', 'stage-0'],
      }
    }, {
      test: /\.less$/,
      loaders: ["style", "css", "less"]
    }, {
      test: /\.scss$/,
      loaders: ["style", "css", "sass"]
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }],
  },
  htmlLoader: {
    minimize: false
  },
  plugins: [],
}

if (minimize) {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    output: {
      comments: false
    }
  }));
}
module.exports = config;
