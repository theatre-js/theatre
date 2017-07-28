// @flow
import developmentEnv from '$root/development.env.json'
import productionEnv from '$root/production.env.json'

declare var $$$NODE_ENV: 'development' | 'production'

let envFileOfInterest

if ($$$NODE_ENV === 'development') { // eslint-disable-line no-undef
  envFileOfInterest = developmentEnv
} else {
  envFileOfInterest = productionEnv
}

const envStuff = {
  ...envFileOfInterest,
  NODE_ENV: $$$NODE_ENV, // eslint-disable-line no-undef
}

export default envStuff