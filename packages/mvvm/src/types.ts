/** For `any`s that aren't meant to stay `any`*/
export type $FixMe = any
/** For `any`s that we don't care about */
export type $IntentionalAny = any

export type VoidFn = () => void

export type Tapper<T> = (value: T) => void

/**
 * Required for UI to be able to react to whether something happened
 * synchronously or not
 */
export enum Outcome {
  Handled = 1,
  Passthrough = 0,
}
