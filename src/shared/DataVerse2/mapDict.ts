import pointer, {Pointer} from './pointer'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import {Pointable, val} from '$shared/DataVerse2/atom'
import {mapValues} from 'lodash-es'

const mapDict = <O extends {}>(
  sourcePointer: Pointer<O>,
  fn: (p: Pointer<O[keyof O]>) => AbstractDerivation<$FixMe>,
): MappedDict<{[K in keyof O]: $FixMe}> => {
  return new MappedDict(sourcePointer, fn)
}

class MappedDict<O> implements Pointable {
  pointer: Pointer<O>
  constructor(readonly sourcePointer: Pointer<$FixMe>, readonly _fn: $FixMe) {
    this.pointer = pointer({root: this, path: []})
  }

  _getIdentityByPath(path: (string | number)[]): mixed {
    const sourceIdentity = val(this.sourcePointer)
    return mapValues(sourceIdentity, (_, key: keyof O) => {
      return this._getIdentifyOfProp(key)
    })
  }

  _getIdentifyOfProp<K extends keyof O>(key: K): O[K] {
    return null as $FixMe
  }

  _tapIntoIdentityOfPathChanges(
    path: (string | number)[],
    cb: (v: mixed) => void,
  ): void {
    throw new Error('Method not implemented.')
  }
}

export default mapDict
