const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const modeDevelopment = "development"
const modeProduction = "production"

module.exports = (env, argv) => {
    const config = {
        mode: argv.mode
    }

    const isDevelopment = config.mode === modeDevelopment
    const isProduction = config.mode === modeProduction

    if (isDevelopment) {
        config.devtool = "source-map"
    }

    config.resolve = {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    }

    config.entry = "./src/index.tsx"

    const outputDirecory = isDevelopment ? "../server/dist" : "../../docs/js/dist"
    config.output = {
        path: path.resolve(__dirname, outputDirecory),
        filename: "main.js",
    }

    config.module = {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            }
        ]
    }

    config.externals = {
        react: "React",
        "react-dom": "ReactDOM"
    }

    config.plugins = [
        new HtmlWebpackPlugin({
            template: "index.html",
            hash: true,
            inject: false,
            path: isDevelopment ? "/" : "https://mining-monitor.github.io/mining-monitor/js/dist/",
            staticPath: "https://mining-monitor.github.io/mining-monitor/js/dist/",
        })
    ]

    return config
}