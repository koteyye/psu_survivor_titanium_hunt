const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/game.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|wav|mp3)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@managers': path.resolve(__dirname, 'src/managers'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@objects': path.resolve(__dirname, 'src/objects'),
      '@scenes': path.resolve(__dirname, 'src/scenes'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
  },
  output: {
    filename: 'game.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets', to: 'assets', noErrorOnMissing: true }
      ]
    })
  ],
  devServer: {
    static: './dist',
    hot: true,
    port: 8080,
  },
  mode: 'development',
  devtool: 'source-map',
};
