import type {Env} from './envSchema'

// process.env is guaranteed to be of type Env, because we validate it in the `devEnv` scripts.
export const env = process.env as Env
