import AbstractAtom from './AbstractAtom'

const isAtom = (v: mixed): v is AbstractAtom<mixed> => {
  // @ts-ignore
  return typeof v === 'object' && v !== null && v.isAtom === true
}

export default isAtom
