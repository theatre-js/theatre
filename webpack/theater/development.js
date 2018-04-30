require('ts-node').register({
  project: require.resolve('../tsconfig.json'),
})

const createWebpackConfigObject = require('./createWebpackConfig')

module.exports = createWebpackConfigObject('development')