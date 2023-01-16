import {Atom} from '@theatre/dataverse'
import {useLayoutEffect, useMemo} from 'react'

export default function useValToAtom<S>(val: S): Atom<S> {
  const atom = useMemo(() => {
    return new Atom(val)
  }, [])

  useLayoutEffect(() => {
    atom.set(val)
  }, [val])

  return atom
}
