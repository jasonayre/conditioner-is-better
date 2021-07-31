

module.exports = {
  mode: 'development',
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  output: {
    library: 'conditioner-is-better',
    libraryTarget: 'umd',
    filename: 'index.js',
    path: __dirname,
    globalObject: '(this)'
  }
};

if (process.env.BABEL_ENV === 'test') {
  console.log("BABEL ENV WAS TEST");
  module.exports.output.filename = '[name].[hash:8].js'
}
