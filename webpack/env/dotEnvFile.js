// @ts-ignore ignore
import developmentEnv from '$root/development.env.json'
// @ts-ignore ignore
import productionEnv from '$root/production.env.json'

// @ts-ignore ignore
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