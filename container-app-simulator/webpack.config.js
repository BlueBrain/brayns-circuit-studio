const package = require("./package.json")
const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { WebpackManifestPlugin } = require("webpack-manifest-plugin")
const Webpack = require("webpack")

module.exports = (env) => {
    const isProdMode = env.WEBPACK_BUILD === true
    const isTestMode = !isProdMode
    if (isProdMode) {
        console.log("+-----------------+")
        console.log("| Production Mode |")
        console.log("+-----------------+")
    }
    return {
        cache: {
            type: "memory",
        },
        output: {
            filename: "scr/[name].[contenthash].js",
            path: path.resolve(__dirname, "build"),
            devtoolModuleFilenameTemplate: "[absolute-resource-path]",
        },
        entry: {
            app: "./src/index.tsx",
        },
        target: "web",
        resolve: {
            extensions: [".tsx", ".ts", ".js", ".jsx", ".wasm"],
            enforceExtension: false,
            alias: {
                "@": path.resolve(__dirname, "src"),
            },
        },
        devtool: isProdMode ? false : "inline-source-map",
        devServer: {
            compress: true,
            static: {
                directory: path.resolve(__dirname, "./public"),
            },
            client: {
                logging: "none",
                overlay: { errors: true, warnings: false },
                progress: true,
            },
            hot: true,
            // Open WebBrowser.
            open: true,
            port: 8081,
        },
        stats: {
            colors: true,
            errorDetails: true,
        },
        plugins: [
            new Webpack.ProgressPlugin(),
            // List of the needed files for later caching.
            new WebpackManifestPlugin({
                filter: (file) => {
                    if (file.name.endsWith(".map")) return false
                    if (file.name.endsWith(".ts")) return false
                    return true
                },
            }),
            new CleanWebpackPlugin({
                // We don't want to remove the "index.html" file
                // after the incremental build triggered by watch.
                cleanStaleWebpackAssets: false,
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, "public"),
                        filter: async (path) => {
                            return !path.endsWith("index.html")
                        },
                    },
                ],
            }),
            new HtmlWebpackPlugin({
                template: "public/index.html",
                filename: "index.html",
                version: package.version,
                title: "Fake Observatory",
                minify: {
                    collapseInlineTagWhitespace: isProdMode,
                    collapseWhitespace: isProdMode,
                    decodeEntities: isProdMode,
                    minifyCSS: isProdMode,
                    removeComments: isProdMode,
                },
            }),
        ],
        performance: {
            hints: "warning",
            maxAssetSize: 300000,
            maxEntrypointSize: 200000,
            assetFilter: (filename) => {
                // PNG are just fallbacks for WEBP images.
                if (filename.endsWith(".png")) return false
                if (filename.endsWith(".map")) return false
                return true
            },
        },
        optimization: {
            splitChunks: {
                chunks: "all",
                cacheGroups: {
                    defaultVendors: {
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        reuseExistingChunk: true,
                    },
                    default: {
                        minChunks: 2,
                        priority: -20,
                        reuseExistingChunk: true,
                    },
                },
            },
            // Prevent "libs.[contenthash].js" from changing its hash if not needed.
            moduleIds: "deterministic",
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: "ts-loader",
                            options: {
                                transpileOnly: false,
                            },
                        },
                    ],
                    exclude: /node_modules/,
                },
                {
                    test: /\.(png|jpe?g|gif|webp|svg)$/i,
                    // More information here https://webpack.js.org/guides/asset-modules/
                    type: "asset",
                    generator: {
                        filename: "img/[name].[hash][ext][query]",
                    },
                },
                {
                    test: /\.(bin)$/i,
                    // More information here https://webpack.js.org/guides/asset-modules/
                    type: "asset",
                    generator: {
                        filename: "bin/[name].[hash][ext][query]",
                    },
                },
                {
                    test: /\.(eot|ttf|woff|woff2)$/i,
                    // More information here https://webpack.js.org/guides/asset-modules/
                    type: "asset/resource",
                    generator: {
                        filename: "fnt/[name].[hash][ext][query]",
                    },
                },
                {
                    test: /\.(vert|frag)$/i,
                    // More information here https://webpack.js.org/guides/asset-modules/
                    type: "asset/source",
                },
                {
                    test: /\.(py|txt|sh|md)$/i,
                    // More information here https://webpack.js.org/guides/asset-modules/
                    type: "asset/source",
                },
                {
                    test: /\.ya?ml$/,
                    type: "json",
                    use: "yaml-loader",
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            // We will use MiniCssExtractPlugin in prod mode later.
                            loader: "style-loader",
                            options: {
                                injectType: "styleTag",
                            },
                        },
                        "css-loader",
                    ],
                },
            ],
        },
    }
}
