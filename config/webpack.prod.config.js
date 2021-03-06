const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.js');
// const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 单独打包css文件

const prodConfig = {
    mode: 'production',
    entry: path.join(__dirname, "./../src/index.js"),
    output: {
        path: path.join(__dirname, "./../lib/"),
        filename: "index.js",
        libraryTarget: 'umd', // 采用通用模块定义
        libraryExport: 'default', // 兼容 ES6 的模块系统、CommonJS 和 AMD 模块规范
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader','css-loader?modules'],
                // use: [{loader:MiniCssExtractPlugin.loader},'css-loader?modules'],
            },
            {
                test: /\.less$/,
                use:['style-loader','css-loader','less-loader'],
                // use:[{loader:MiniCssExtractPlugin.loader},'css-loader','less-loader']
            },
            {
                test:/\.(png|svg|jpg|gif)$/,
                use:[
                    {
                        loader:"url-loader",
                        options:{
                            limit:30720,//默认单位为bytes
                            name:'img/[name]-[hash:8].[ext]',
                            esModule: false,
                        }
                    }
                ]
            }
        ]
    },
    // plugins: [
    //     new MiniCssExtractPlugin({
    //         filename: "main.min.css" // 提取后的css的文件名
    //     })
    // ],
    resolve:{
        extensions:['.js','.jsx','.json'],
        alias:{
            '@':path.join(__dirname,'./../src')
        }
    },
    externals: { // 定义外部依赖，避免把react和react-dom打包进去
        react: {
            root: "React",
            commonjs2: "react",
            commonjs: "react",
            amd: "react"
        },
        "react-dom": {
            root: "ReactDOM",
            commonjs2: "react-dom",
            commonjs: "react-dom",
            amd: "react-dom"
        }
    },
};

module.exports = merge(prodConfig, baseConfig); // 将baseConfig和prodConfig合并为一个配置