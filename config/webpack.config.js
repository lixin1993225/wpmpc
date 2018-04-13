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
const prod = process.env.NODE_ENV === 'production' ? true : false;
const config = {
    entry:Object.assign(entriesObj,{
        vendors:'jquery'
    }) ,
    output: {
        path: path.resolve(__dirname, prod ? "../dist" : "../build"),
        filename: prod ? "js/[name].[hash:8].min.js" : "js/[name].[hash:8].js",
        chunkFilename: prod ?'js/[name].js':'',
        publicPath: prod ?"../":''//prod ? "http:cdn.mydomain.com" : ""
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
        }, {
            test: /\.less$/,
            use: ExtractTextPlugin.extract({fallback:'style-loader',use:['css-loader','less-loader'] })
        }, {
            test: /\.js[x]?$/,
            exclude: /node_modules/,
            use: 'babel-loader'
        }, {
            test: /\.html$/,
            use: 'html-loader?attrs=img:src img:srcset'
        }]
    },
    externals: {
        jquery: 'window.$'
    },
    // externals:{
    //     'jquery':'window.$'
    // },
    plugins: [
        // new webpack.ProvidePlugin({
        //     $:"jquery",
        //     jQuery:"jquery",
        //     "window.jQuery":"jquery"
        // }),
        new CleanPlugin(['dist', 'build'],{
            root:path.dirname(__dirname)
        }),
        // 启动热替换
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin({filename:'css/[name].[contentHash:8].css'}),
        // new OpenBrowserPlugin({
        //     url: 'http://localhost:8080'
        // }),
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
    console.log(__dirname,basename)
    let conf = {
        filename:'html/'+basename+'.html',
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
    config.devtool = '#cheap-module-eval-source-map';
    config.devServer = {
        port: 8087,
        host:'0.0.0.0',
        hot: true,
        overlay:{
            errors:true
        }
        // plugins: [
        //     new webpack.HotModuleReplacementPlugin()
        // ]
    };
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),    
    )
}
module.exports = config