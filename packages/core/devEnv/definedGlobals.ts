import type {Env} from '@theatre/core/envSchema'
import type {$IntentionalAny} from '@theatre/utils/types'
// This file gets imported by other packages who may ot have set up path aliases, so we should use relative imports here
// eslint-disable-next-line no-relative-imports
import {fullSchema} from '../src/envSchema'

const env: Env = {
  THEATRE_VERSION: require('../package.json').version,
  BUILT_FOR_PLAYGROUND: 'false',
  BACKEND_URL: `https://app.theatrejs.com`,
}

fullSchema.parse(env)

export const definedGlobals: Record<string, string> = {
  // json-touch-patch (an unmaintained package) reads this value. We patch it to just 'Set', becauce
  // this is only used in `@theatre/studio`, which only supports evergreen browsers
  'global.Set': 'Set',
}

for (const entry of Object.entries(env)) {
  const [key, value] = entry as $IntentionalAny
  definedGlobals[`process.env.${key}`] = JSON.stringify(value)
}
