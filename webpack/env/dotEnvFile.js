// @ts-ignore ignore
const developmentEnv = require('../../development.env.json')
// @ts-ignore ignore
const productionEnv = require('../../production.env.json')

// @ts-ignore ignore
// declare var $$$NODE_ENV: 'development' | 'production'

let envFileOfInterest

// @ts-ignore ignore
if ($$$NODE_ENV === 'development') {
  envFileOfInterest = developmentEnv
} else {
  envFileOfInterest = productionEnv
}

const envStuff = {
  ...envFileOfInterest,
  // @ts-ignore ignore
  NODE_ENV: $$$NODE_ENV,
}

module.exports = envStuff
