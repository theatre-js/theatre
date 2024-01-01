import type {Env} from '@theatre/core/envSchema'
import type {$IntentionalAny} from '@theatre/utils/types'

// process.env is guaranteed to be of type Env, because we validate it in `devEnv/cli`
export const env = process.env as $IntentionalAny as Env
