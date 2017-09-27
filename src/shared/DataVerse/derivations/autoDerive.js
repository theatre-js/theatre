// @flow
import type Derivation from './Derivation'
import AutoDerivation from './AutoDerivation'

export default function autoDerive<T>(fn: () => T): Derivation<T> {
  return new AutoDerivation(fn)
}