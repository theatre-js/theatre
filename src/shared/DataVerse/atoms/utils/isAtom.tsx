import AbstractAtom from '$src/shared/DataVerse/atoms/utils/AbstractAtom'

// type IsAtomFn = (<V: IAtom>(v: V) => true) & (<V>(v: V) => false)

const isAtom = (v: mixed): v is AbstractAtom<{}> => {
  // @ts-ignore
  return typeof v === 'object' && v !== null && v.isAtom === true
}

export default isAtom
