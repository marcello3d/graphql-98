const rules = require('./webpack.rules');

module.exports = {
  module: { rules },
  output: { chunkFilename: 'app/[name].chunk.js', publicPath: '../' },
  plugins: [],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
