const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.js');
const htmlWebpackPlugin = require('html-webpack-plugin');

const devConfig = {
    mode: 'development',
    entry: path.join(__dirname, "./../example/src/index.js"),
    output: {
        path: path.join(__dirname, "./../example/src/"),
        filename: "bundle.js",
    },
    plugins: [
        new htmlWebpackPlugin({
          template: path.join(__dirname, './../example/index.html'),
          filename: 'index.html'
        })
      ],
    resolve:{
        extensions:['.js','.jsx','.json'],//这几个后缀名的文件后缀可以省略不写
        alias:{
            '@':path.join(__dirname,'./../src')//这样 @就表示根目录src这个路径
        }
    },
    devtool:'inline-source-map',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader','css-loader?modules'],
            },
            {
                test: /\.less$/,
                use:['style-loader','css-loader','less-loader']
            },
            {
                test:/\.(png|svg|jpg|gif)$/,
                use:[
                    {
                        loader:"url-loader",
                        options:{
                            limit:30720,//默认单位为bytes
                        }
                    }
                ]
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, './../example/src/'),
        compress: true,
        port: 3002,
        open: true // 自动打开浏览器
    },
};
module.exports = merge(devConfig, baseConfig); // 将baseConfig和devConfig合并为一个配置