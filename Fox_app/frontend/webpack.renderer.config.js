const webpack = require('webpack');
const rules = require('./webpack.rules');
const Dotenv = require('dotenv-webpack');
module.exports = {
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css']
  },
  plugins: [
    new Dotenv(),
  ]
};