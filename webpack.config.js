const path = require('path');
const webpack = require('webpack')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin'); // use V 1.0.1
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var LiveReloadPlugin = require('webpack-livereload-plugin');
// const ChromeManifestPlugin = require('chrome-manifest-plugin');
const webpackDashboard = require('webpack-dashboard/plugin');

const devMode = process.env.NODE_ENV !== 'production'
const isEnvProduction = process.env.NODE_ENV == 'production'

const PATHS = {

    app: path.join(__dirname, 'app'),
    dist: path.join(__dirname, 'dist'),
    public: path.join(__dirname, 'public'),

    backgroundHtml: path.join(__dirname, 'public/background.html'),
    popupHtml: path.join(__dirname, 'public/popup.html'),
    optionsHtml: path.join(__dirname, 'public/options.html'),
};

// plugin confs
const HTMLProdConf =  {
    minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
    },
}

module.exports = {
    "mode": devMode ? 'development' : 'production',
    "entry": {
        // 'scripts/popup.js': './`app`/scripts.babel/popup.js',
        // 'scripts/background.js': './app/scripts.babel/background.js',
        // 'scripts/options.js': './app/scripts.babel/options.js',
        // 'scripts/chromereload.js': './app/scripts.babel/chromereload.js',

        'static/js/popup.bundle.js': './src/popup/index.js',
        'static/js/background.bundle.js': './src/background/index.js',
        'static/js/options.bundle.js': './src/options/index.js',
        'static/js/contentscript.bundle.js': './src/contentscript/index.js',

    },
    "output": {
        "path": PATHS.app,
        "filename": '[name]',
    },
    // webpack uses evals in dev mode which causes and CSP unsafe eval error
    // setting inline-cheap-source-map removes the use of evals in the bundled file
    devtool: devMode ? 'inline-cheap-source-map': 'false',
    devServer: {
        writeToDisk: true,
        contentBase: PATHS.app,
        hot: true,
        index: "popup.html",
        compress: true,
        // host: '0.0.0.0',
        // port: 3000
    },

    watch: devMode ? true : false,
    watchOptions: {
        ignored: /node_modules/,
    },
    node: {
        global: false
    },
    "module": {
        "rules": [
            {
                "enforce": "pre",
                "test": /\.(js|jsx)$/,
                "exclude": /node_modules/,
                "use": "eslint-loader"
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',

                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-proposal-object-rest-spread',
                            '@babel/plugin-transform-runtime'
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    // 'postcss-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader: 'url-loader',
                options: {
                  limit: 10000,
                },
            },
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                }
            }
        ]
    },
    "plugins": [
        new CleanWebpackPlugin([`${PATHS.dist}/**`, `${PATHS.app}/**`]),
        new LiveReloadPlugin(),
        new webpackDashboard(),

        ...["background", "popup", "options"].map(page => {
            return new HtmlWebpackPlugin({
                ...{
                    inject: true,
                    template: PATHS[`${page}Html`],
                    filename: `../app/${page}.html`,
                    chunks: [`static/js/${page}.bundle.js`],
                },
                ...(isEnvProduction? HTMLProdConf: {})
            })
        }),

        new webpack.optimize.ModuleConcatenationPlugin(),
        new MiniCssExtractPlugin({filename: "[name]-[contenthash:8].css"}),

        new CopyWebpackPlugin([
            isEnvProduction ?
            { from: 'public/manifest.prod.json' ,to: `${PATHS.dist}/manifest.json` }
            :{ from: 'public/manifest.json' },
            {
                from: '**/*.*', to: isEnvProduction? PATHS.dist: PATHS.app,
                context: PATHS.public , ignore: ['**/secrets/**/*', '**/manifest*'], dot: true
            }
        ]),
    ]
}


