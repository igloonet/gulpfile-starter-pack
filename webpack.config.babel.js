import webpack from 'webpack';

module.exports = {
  entry: {
    preload: [__dirname + '/js/scripts.js'] // 'babel-polyfill'
  },
  output: {
    path: __dirname + '/js',
    publicPath: 'js/',
    filename: '[name].bundle.js',
    chunkFilename: '[id].bundle.js'
  },
  devtool: 'source-map',
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ]
};
