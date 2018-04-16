const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const pagesPath = require("./pagespath.js")
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
let entriesObj = pagesPath.getView('./src/**/*.js');
const prod = process.env.NODE_ENV === 'production'
console.log(process.env.NODE_ENV)
const config = {
    entry:Object.assign(entriesObj,{
        vendors:'jquery'
    }) ,
    output: {
        path: path.resolve(__dirname, "./dist" ),
        filename: "js/[name].[hash:8].min.js" ,
        chunkFilename: 'js/[name].js',
        publicPath: prod ? "../" : ""
    },
    resolve: {
        //配置项,设置忽略js后缀
        extensions: ['.js', '.less', '.css', '.png', '.jpg'],
        modules:[
            path.resolve(__dirname,'node_modules'),
            path.join(__dirname,'./src')
        ]
    },
    module: {
        rules: [{
            test: /\.(png|jpg|jpeg|gif)$/,
            use:[
                {
                    loader:"url-loader",
                    options:{
                        limit:1024,
                        name:'images/[name].[ext]',
                        outputPath:'img',
                        publicPath:'output',
                        publicPath:'./images'
                    }
                }
            ]
        },
        {
            test: /\.html$/,
            use: 'html-loader?attrs=img:src img:srcset'
        }]
    },
    externals: {
        jquery: 'window.$'
    },
    plugins: [
        new CleanPlugin(['dist'],{
            root:__dirname
        }),
        /* 公共库 */
        new CommonsChunkPlugin({
            name: 'vendors',
            minChunks: Infinity
        }),
    ]
};
let pages = Object.keys(pagesPath.getView('./src/**/*.html'));//获取页面
pages.forEach(pathname=>{
    //let htmlname = pathname.split('src\\')[1];
    let extname2 = path.extname(pathname);//文件后缀
    let basename = path.basename(pathname,extname2)
    let conf = {
        filename:prod?'html/':''+basename+'.html',
        //`${basename}.html`,
        template:`${pathname}.html`,
        hash:true,
        chunks:['vendors',basename],//引入页面的js文件包括公共js文件
        // minify:{
        //     removeAttributeQuotes:true,
        //     removeComments: true,
        //     collapseWhitespace: true,
        //     removeScriptTypeAttributes:true,
        //     removeStyleLinkTypeAttributes:true
        // }
    }
    config.plugins.push(new HtmlWebpackPlugin(conf))
});
// 判断开发环境还是生产环境,添加uglify等插件
if (process.env.NODE_ENV === 'production') {
    config.plugins.push(
        new ExtractTextPlugin({filename:'css/[name].[contentHash:8].css'})
    );
    config.module.rules.push(
        {
            test:/\.styl$/,
            use:ExtractTextPlugin.extract({
                fallback:'style-loader',
                use:[
                    'css-loader',
                    {
                        loader:'postcss-loader',
                        options:{
                            sourceMap:true
                        }
                    },
                    'stylus-loader'
                ]
            })
        },
        {
            test: /\.less$/,
            use: ExtractTextPlugin.extract({
                    fallback:'style-loader',
                    use:[
                        'css-loader',
                        {
                            loader:'postcss-loader',
                            options:{
                                sourceMap:true
                            }
                        },
                        'less-loader'
                    ]
            })
        }
    );
    config.plugins = (config.plugins || [])
        .concat([
            new webpack.DefinePlugin({
                __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            }),
            //new webpack.optimize.OccurenceOrderPlugin(),
        ]);
} else {
    config.module.rules.push(
        {
            test:/\.styl$/,
            use:[
                "style-loader",
                "css-loader",
                {
                    loader:"postcss-loader",
                    options:{
                        sourceMap:true
                    }
                },
                "stylus-loader"
            ]
        },
        {
            test: /\.less$/,
            use: [
                "style-loader",
                "css-loader",
                {
                    loader:"postcss-loader",
                    options:{
                        sourceMap:true
                    }
                },
                "less-loader"
            ]
        }
    );
    config.devtool = '#cheap-module-eval-source-map';
    config.devServer = {
        port: '8810',
        host:'0.0.0.0',
        hot: true,
        inline:true,
        overlay:{
            errors:true
        }
        // plugins: [
        //     new webpack.HotModuleReplacementPlugin()
        // ]
    };
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    )
}
module.exports = config