require('ts-node').register({transpileOnly: true, skipProject: true})

const createWebpackConfigObject = require('./createWebpackConfig')

// @ts-ignore
module.exports = createWebpackConfigObject('production')
