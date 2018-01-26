// @flow

export const ensureNoAtoms = (d: $IntentionalAny) => {
  if (typeof d === 'object' && d !== null && !Array.isArray(d)) {
    if (d.isDictAtom === true) {
      return d.derivedDict()
    } else if (d.isArrayAtom === true) {
      return d.derivedArray()
    } else if (
      d.isDerivedDict === true ||
      d.isDerivedArray === true ||
      d.isDerivation === true
    ) {
      return d
    } else {
      // console.warn('check this')
      return d
    }
  } else {
    return d
  }
}
