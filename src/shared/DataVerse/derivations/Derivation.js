// @flow
import Emitter from '$shared/DataVerse/utils/Emitter'
import Context from '$shared/DataVerse/Context'
import goog from './autoDerivationGogool'

let lastDerivationId = 0
const weakMapOfDerivations = new WeakMap()

export default class Derivation<V> {
  _id: {id: number}
  _changeEmitter: *
  _dataVerseContext: ?Context
  _isUptodate: *
  _lastValue: ?V
  _idsOfDependents: *
  +_recalculate: () => V
  +_onWhetherPeopleCareAboutMeStateChange: ?(peopleCare: boolean) => void
  _peopleCare: boolean
  getValue: () => V
  +_getValue: () => V


  constructor() {
    this._id = {id: lastDerivationId++}
    weakMapOfDerivations.set(this._id, this)

    this._dataVerseContext = null
    this._changeEmitter = new Emitter()
    this._changeEmitter.onNumberOfTappersChange(() => {
      this._reactToNumberOfTappersChange()
    })
    this._isUptodate = false
    this._lastValue = undefined
    this._peopleCare = false
    this._idsOfDependents = new Set()
  }

  changes() {
    if (!this._dataVerseContext)
      throw new Error(`Can't have tappers without a DataVerseContext set first`)

    return this._changeEmitter.tappable
  }

  setDataVerseContext(dv: Context) {
    if (!this._dataVerseContext) {
      this._dataVerseContext = dv
    } else {
      if (this._dataVerseContext === dv) return this
      throw new Error(`This derivation already has a DataVerseContext, and it doesn't match what you're providing here`)
    }

    return this
  }

  _tick() {
    this._changeEmitter.emit(this.getValue())
  }

  _hasDependents() {
    return this._idsOfDependents.size !== 0
  }

  _addDependent(d: Derivation<$IntentionalAny>) {
    const hadDepsBefore = this._idsOfDependents.size > 0
    this._idsOfDependents.add(d._id)
    const hasDepsNow = this._idsOfDependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reevaluateWhetherPeopleCare()
    }
  }

  _garbageCollectDependents() {
    const hadDepsBefore = this._idsOfDependents.size > 0

    this._idsOfDependents.forEach((id) => {
      if (!weakMapOfDerivations.get(id)) {
        this._idsOfDependents.delete(id)
      }
    })

    const hasDepsNow = this._idsOfDependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reevaluateWhetherPeopleCare()
    }
  }

  _removeDependent(d: Derivation<$IntentionalAny>) {
    const hadDepsBefore = this._idsOfDependents.size > 0
    this._idsOfDependents.delete(d._id)
    const hasDepsNow = this._idsOfDependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reevaluateWhetherPeopleCare()
    }
  }

  _youMayNeedToUpdateYourself(msgComingFrom?: mixed) {
    if (!this._isUptodate) return

    this._isUptodate = false
    if (this._hasDependents()) {
      let shouldGarbageCollectDependents = false
      this._idsOfDependents.forEach((idd) => {
        const dependent = weakMapOfDerivations.get(idd)
        if (dependent) {
          dependent._youMayNeedToUpdateYourself(this)
        } else {
          shouldGarbageCollectDependents = true
        }
      })
      if (shouldGarbageCollectDependents) {
        this._garbageCollectDependents()
      }

    }
    if (this._changeEmitter.hasTappers() && this._dataVerseContext) {
      this._dataVerseContext.addDerivationToUpdate(this)
    }
  }

  getValue(): V {
    goog.addObservedDepToCurrentStackTop(this)
    return this._getValue()
  }

  _getValue(): V {
    if (!this._isUptodate) {
      const unboxed = this._recalculate()
      this._lastValue = unboxed
      this._isUptodate = true
    }
    return (this._lastValue: $IntentionalAny)
  }

  _reactToNumberOfTappersChange() {
    // if (this._changeEmitter.hasTappers() && !this._isUptodate && this._dataVerseContext) {
    //   this._dataVerseContext.addDerivationToUpdate(this)
    // }

    this._reevaluateWhetherPeopleCare()
  }

  _reevaluateWhetherPeopleCare() {
    const theyCare = this._changeEmitter.hasTappers() || this._idsOfDependents.size > 0
    if (theyCare !== this._peopleCare) {
      this._peopleCare = theyCare
      if (this._onWhetherPeopleCareAboutMeStateChange) {
        this._onWhetherPeopleCareAboutMeStateChange(theyCare)
      }
    }
  }

  map<T>(fn: (oldVal: V) => T): Derivation<T> {
    return (new SimpleDerivation.default({dep: this}, (deps) => fn(deps.dep.getValue())): $FixMe)
  }

  flatMap<T, P>(fn: (oldVal: V) => Derivation<T> | P): Derivation<T | P> {
    return this.map(fn).flatten()
  }

  flatten(): Derivation<$FixMe> {
    return this.flattenDeep(1)
  }

  flattenDeep(levels?: number): Derivation<$FixMe> {
    return new FlattenDeepDerivation.default(this, levels)
  }
}

const FlattenDeepDerivation = require('./FlattenDeepDerivation')
const SimpleDerivation = require('./SimpleDerivation')