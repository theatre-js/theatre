// @flow
import Emitter from '$shared/DataVerse/utils/Emitter'
import Context from '$shared/DataVerse/Context'
import goog from './autoDerivationGogool'

let lastDerivationId = 0

export default class Derivation<V> {
  _id: number
  _changeEmitter: *
  _dataVerseContext: ?Context
  _isUptodate: *
  _lastValue: ?V
  _dependents: Set<Derivation<$IntentionalAny>>
  +_recalculate: () => V
  +_onWhetherPeopleCareAboutMeStateChange: ?(peopleCare: boolean) => void
  _peopleCare: boolean
  getValue: () => V
  +_getValue: () => V


  constructor() {
    this._id = lastDerivationId++

    this._dataVerseContext = null
    this._changeEmitter = new Emitter()
    this._changeEmitter.onNumberOfTappersChange(() => {
      this._reactToNumberOfTappersChange()
    })
    this._isUptodate = false
    this._lastValue = undefined
    this._peopleCare = false
    this._dependents = new Set()
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
    return this._dependents.size !== 0
  }

  _addDependent(d: Derivation<$IntentionalAny>) {
    const hadDepsBefore = this._dependents.size > 0
    this._dependents.add(d)
    const hasDepsNow = this._dependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reevaluateWhetherPeopleCare()
    }
  }

  _removeDependent(d: Derivation<$IntentionalAny>) {
    const hadDepsBefore = this._dependents.size > 0
    this._dependents.delete(d)
    const hasDepsNow = this._dependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reevaluateWhetherPeopleCare()
    }
  }

  _youMayNeedToUpdateYourself(msgComingFrom?: Derivation<$IntentionalAny>) {
    if (!this._isUptodate) return

    this._isUptodate = false
    if (this._hasDependents()) {
      this._dependents.forEach((dependent) => {
        dependent._youMayNeedToUpdateYourself(this)
      })

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
    const theyCare = this._changeEmitter.hasTappers() || this._dependents.size > 0
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