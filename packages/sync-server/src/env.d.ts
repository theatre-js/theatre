import type {Env} from './envSchema'

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
