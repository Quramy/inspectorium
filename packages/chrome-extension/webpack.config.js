const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    contentScript: path.resolve(__dirname, "src/content_script/index.tsx"),
    background: path.resolve(__dirname, "src/background.ts"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ",tsx", ".js"],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, exclude: /node_modules/, loader: "light-ts-loader" },
      // {
      //   test: /\.css$/,
      //   use: ExtractTextPlugin.extract([
      //     {
      //       loader: "css-loader",
      //       options: {
      //         modules:true,
      //         localIdentName: env !== "prod" ? "[name]_[local]" : "[hash:base64]"
      //       },
      //     },
      //     "postcss-loader"
      //   ]),
      // },
    ],
  },
};
