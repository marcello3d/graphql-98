const rules = require('./webpack.rules');

module.exports = {
  module: { rules },
  plugins: [],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
