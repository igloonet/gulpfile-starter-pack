module.exports = {
  entry: {
    preload: [__dirname + '/js/scripts.js'] // 'babel-polyfill'
  },
  output: {
    path: __dirname + '/js',
    publicPath: 'js/',
    filename: '[name].bundle.js',
    chunkFilename: '[id].bundle.js'
  }
};
