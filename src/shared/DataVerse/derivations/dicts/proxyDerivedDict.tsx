import AbstractDerivedDict from './AbstractDerivedDict'
import * as _ from '$shared/utils'
import boxAtom, {BoxAtom} from '$shared/DataVerse/atomsDeprecated/boxAtom'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import noop from '$shared/utils/noop'
import {VoidFn} from '$shared/types'

export class ProxyDerivedDict<O> extends AbstractDerivedDict<O> {
  _sourceBox: BoxAtom<AbstractDerivedDict<O>>
  _sourceBoxD: AbstractDerivation<AbstractDerivedDict<O>>
  _untapFromSourceChanges: VoidFn

  constructor(source: AbstractDerivedDict<O>) {
    super()
    this._untapFromSourceChanges = noop

    this._sourceBox = boxAtom(source)
    this._sourceBoxD = this._sourceBox.derivation()

    return this
  }

  setSource(newSource: AbstractDerivedDict<O>): this {
    const oldSource = this._sourceBox.getValue()
    this._sourceBox.set(newSource)

    if (this._changeEmitterHasTappers) {
      this._reactToNotHavingTappers()
      this._reactToHavingTappers()

      const oldKeys = oldSource ? oldSource.keys() : []
      const newKeys = newSource ? newSource.keys() : []

      const change = {
        addedKeys: _.difference(newKeys, oldKeys),
        deletedKeys: _.difference(oldKeys, newKeys),
      }

      if (change.addedKeys.length > 0 || change.deletedKeys.length > 0)
        this._changeEmitter.emit(change)
    }

    return this
  }

  _reactToHavingTappers() {
    const newSource = this._sourceBox.getValue()
    if (newSource) {
      this._untapFromSourceChanges = newSource.changes().tap(c => {
        this._changeEmitter.emit(c)
      })
    }
  }

  _reactToNotHavingTappers() {
    this._untapFromSourceChanges()
    this._untapFromSourceChanges = _.noop
  }

  keys() {
    return this._sourceBox.getValue().keys()
  }

  prop<K extends keyof O>(key: K) {
    return this._sourceBoxD.flatMap(source => source.prop(key))
  }

  // _directProp(key) {
  //   // return this._source.prop(key)
  // }
}

export default function proxyDerivedDict<O>(
  initialSource: AbstractDerivedDict<O>,
): ProxyDerivedDict<O> {
  return new ProxyDerivedDict(initialSource)
}
