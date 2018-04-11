var path = require('path');
var webpack = require('webpack');
var glob = require('glob');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var OpenBrowserPlugin = require('open-browser-webpack-plugin');
var CleanPlugin = require('clean-webpack-plugin');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
function getView(globPasth){
    let files = glob.sync(globPasth);
    let entries = {},
        entry,
        dirname,
        basename,
        pathname,
        extname;
    files.forEach(item=>{
        entry = item;
        dirname = path.dirname(entry);//当前目录,不包含文件
        extname = path.extname(entry);//文件后缀
        basename = path.basename(entry,extname);//文件得名字，不带后缀得文件名字
        pathname = path.join(dirname,basename);//文件路径
        if(extname ==='.html'){
            entries[pathname] = './'+ entry;
        }else{
            entries[basename] = entry
        }
    });
    return entries
};
let entriesObj = getView('./src/**/*.js');
var prod = process.env.NODE_ENV === 'production' ? true : false;
var config = {
    entry:Object.assign(entriesObj,{
        vendors:'jquery'
    }) ,
    output: {
        path: path.resolve(__dirname, prod ? "./dist" : "./build"),
        filename: prod ? "js/[name].[chunkhash:8].min.js" : "js/[name].[hash:8].js",
        chunkFilename: 'js/[name].chunk.js',
        publicPath: "../"//prod ? "http:cdn.mydomain.com" : ""
    },
    resolve: {
        //配置项,设置忽略js后缀
        extensions: ['', '.js', '.less', '.css', '.png', '.jpg'],
        root: './src',
        // 模块别名
        alias: {
            //jquery:'src/lib/jquery-3.3.1.js'
        }
    },
    module: {
        loaders: [{
            test: /\.(png|jpg|jpeg|gif)$/,
            loader: 'url?limit=10000&name=images/[name].[ext]&outputPath=img/&publicPath=output/',
            options:{
                publicPath:'./images'
            }
        }, {
            test: /\.less$/,
            loader: ExtractTextPlugin.extract('style', 'css!less',{
                publicPath:'../'
            })
        }, {
            test: /\.js[x]?$/,
            exclude: /node_modules/,
            loader: 'babel?presets[]=es2015&presets[]=react'
        }, {
            test: /\.html$/,
            loader: 'html?attrs=img:src img:srcset'
        }]
    },
    externals:{
        'jquery':'window.$'
    },
    plugins: [
        // new HtmlWebpackPlugin({
        //     filename: 'index.html',
        //     template: './src/index/index.html'
        // }),
        new CleanPlugin(['dist', 'build']),
        // 启动热替换
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin('css/[name].[contentHash:8].css', {
            allChunks: true
        }),
        new webpack.NoErrorsPlugin(),
        new OpenBrowserPlugin({
            url: 'http://localhost:8080'
        }),
        /* 公共库 */
        new CommonsChunkPlugin({
            name: 'vendors',
            minChunks: Infinity
        }),
    ]
};
let pages = Object.keys(getView('./src/**/*.html'));//获取页面
pages.forEach(pathname=>{
    //let htmlname = pathname.split('src\\')[1];
    let extname2 = path.extname(pathname);//文件后缀
    let basename = path.basename(pathname,extname2)
    console.log(pathname,basename)
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
            new webpack.optimize.OccurenceOrderPlugin(),
        ]);
} else {
    config.devtool = '#cheap-module-eval-source-map';
    config.devServer = {
        port: 8080,
        contentBase: './build',
        hot: true,
        historyApiFallback: true,
        publicPath: "",
        stats: {
            colors: true
        },
        plugins: [
        new webpack.HotModuleReplacementPlugin()
        ]
    };
}
module.exports = config