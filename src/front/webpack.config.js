const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const modeDevelopment = "development"
const modeProduction = "production"

module.exports = (env, argv) => {
    const config = {
        mode: argv.mode
    }

    if (config.mode === modeDevelopment) {
        config.devtool = "source-map"
    }

    config.resolve = {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    }

    config.entry = "./src/index.tsx"

    const outputDirecory = config.mode === modeDevelopment ? "../server/dist" : "../../docs/dist"
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
        })
    ]

    return config
}