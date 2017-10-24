// @flow
import type {default as TheStudioClass} from '$studio/TheStudioClass'
import * as D from '$shared/DataVerse'
import noop from 'lodash/noop'

type FinalFace = $FixMe
type DVContext = $FixMe

export default class SideEffectsHandler {
  _dataverseContext: TheStudioClass
  _mapOfStopEffectFnBySideEffectKey: {[key: string | number]: () => void}
  _mapOfUntapFromEachSideEffectKeyPChagnes: {[key: string | number]: () => void}
  _sideEffectsDictP: D.IDerivation<D.IDerivedDict<$FixMe>>
  _finalFace: $FixMe
  _currentDict: D.IDerivedDict<$FixMe>
  _mapOfuntapFnsForEachSideEffect: {[key: string | number]: () => void}
  _untapFromSideEffectsDictPChanges: () => void
  _untapFromDictChanges: () => void
  _started: boolean

  constructor(dataVerseContext: DVContext, finalface: $FixMe, sideEffectsDictP: D.IPointerToBoxAtom<D.IDerivedDict<$FixMe>>) {
    this._dataverseContext = dataVerseContext
    this._mapOfStopEffectFnBySideEffectKey = {}
    this._mapOfUntapFromEachSideEffectKeyPChagnes = {}
    this._sideEffectsDictP = sideEffectsDictP.pointer().setDataVerseContext(dataVerseContext)
    this._finalFace = finalface
    // $FixMe
    this._currentDict = null
    this._mapOfuntapFnsForEachSideEffect = {}
    this._untapFromDictChanges = noop
    // could use D.derivations.autoProxyDerivedDict here
    this._untapFromSideEffectsDictPChanges = noop
    this._started = false
  }

  startAppying() {
    if (this._started) {
      throw new Error(`This SideEffectsHandler is already started`)
    }

    this._started = true

    this._untapFromSideEffectsDictPChanges = this._sideEffectsDictP.changes().tap((newDict) => {
      this._stopApplyingCurrentDict()
      this._useNewDict(newDict)
    })

    this._useNewDict(this._sideEffectsDictP.getValue())
  }

  _useNewDict(dict: D.IDerivedDict<$FixMe>) {
    this._currentDict = dict


    dict.keys().forEach(this._startObservingKey)

    this._untapFromDictChanges = dict.changes().tap((changes) => {
      changes.deletedKeys.forEach(this._stopObservingKey)
      changes.addedKeys.forEach(this._startObservingKey)
    })
  }

  _stopApplyingCurrentDict() {
    for (let key in this._mapOfUntapFromEachSideEffectKeyPChagnes) {
      this._stopObservingKey(key)
    }

    this._untapFromDictChanges()
    this._untapFromDictChanges = noop
  }

  _startObservingKey = (key: string) => {
    const pointerToSideEffectFn =
      this._currentDict.pointer().prop(key).setDataVerseContext(this._dataverseContext)

    this._mapOfUntapFromEachSideEffectKeyPChagnes[key] = pointerToSideEffectFn.changes().tap((newFn) => {
      this._stopSideEffect(key)
      this._startSideEffect(key, newFn)
    })

    this._startSideEffect(key, pointerToSideEffectFn.getValue())
  }

  _stopObservingKey = (key: string) => {
    this._stopSideEffect(key)
    const untap = this._mapOfUntapFromEachSideEffectKeyPChagnes[key]
    if (untap) {
      untap()
      delete this._mapOfUntapFromEachSideEffectKeyPChagnes[key]
    } else {
      console.warn('check this')
    }
  }

  stopApplying() {
    if (!this._started) {
      throw new Error(`This SideEffectsHandler has never been started`)
    }
    this._started = false

    this._untapFromSideEffectsDictPChanges()
    this._untapFromSideEffectsDictPChanges = noop
    this._stopApplyingCurrentDict()
  }

  _stopSideEffect(key: string) {
    const stopFn = this._mapOfStopEffectFnBySideEffectKey[key]
    if (stopFn) {
      stopFn()
      delete this._mapOfStopEffectFnBySideEffectKey[key]
    }
  }

  _startSideEffect(key: string, fn: (FinalFace, DVContext) => () => void) {
    this._stopSideEffect(key)
    this._mapOfStopEffectFnBySideEffectKey[key] = fn(this._finalFace, this._dataverseContext)
  }
}