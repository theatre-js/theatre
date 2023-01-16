import {Atom, prism} from '@theatre/dataverse'

/**
 * A prism hook that converts `val` into an atom, and returns that atom.
 */
export const valToAtom = <T>(key: string, vals: T): Atom<T> => {
  const a = prism.memo(key, () => new Atom(vals), [])
  a.set(vals)
  return a
}
