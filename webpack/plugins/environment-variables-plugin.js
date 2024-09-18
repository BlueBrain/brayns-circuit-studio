const webpack = require("webpack")
const FRONTEND_EXPOSED_BCS_VARIABLES = require("./exposed-variables")

const plugin = (env) => {
    const dotEnvFilePath = env.hasOwnProperty("DOTENV_PATH") ? env["DOTENV_PATH"] : ".env"
    const frontendEnvVariables = {}

    require("dotenv").config({path: dotEnvFilePath})

    console.log(`Frontend Env Variables Plugin"`)
    console.log(`.env path="${dotEnvFilePath}`)

    Object.keys(process.env).forEach((key) => {
        if (FRONTEND_EXPOSED_BCS_VARIABLES.includes(key)) {
            frontendEnvVariables[key] = process.env[key]
        }
    })

    const envVariables = JSON.stringify(frontendEnvVariables)
    console.log(`ENV_VARIABLES=${envVariables}`)

    return new webpack.DefinePlugin({
        ENV_VARIABLES: envVariables,
    })
}
module.exports = plugin
