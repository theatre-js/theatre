// @flow

export const ensureNoAtoms = (d: mixed) => {
  if (typeof d === 'object' && d !== null && !Array.isArray(d)) {
    if (d.isDictAtom === 'True') {
      return d.derivedDict()
    } else if (d.isArrayAtom === 'True') {
      return d.derivedArray()
    } else if (d.isDerivedDict === 'True' || d.isDerivedArray === 'True' || d.isDerivation === 'True') {
      return d
    } else {
      console.warn('check this')
      return d
    }
  } else {
    return d
  }
}