require('ts-node').register({transpileOnly: true, skipProject: true})

const createWebpackConfigObject = require('./createWebpackConfig')

module.exports = createWebpackConfigObject('production')
