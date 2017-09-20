// @flow
import Emitter from '$shared/DataVerse/utils/Emitter'
import Context from '$shared/DataVerse/Context'
import SimpleDerivation from './SimpleDerivation'

export default class Derivation {
  _changeEmitter: *
  _dataVerseContext: ?Context
  _isUptodate: *
  _lastValue: *
  _dependents: *
  +_recalculate: () => mixed
  +_onWhetherPeopleCareAboutMeStateChange: ?(peopleCare: boolean) => void
  _peopleCare: boolean

  constructor() {
    this._dataVerseContext = null
    this._changeEmitter = new Emitter()
    this._changeEmitter.onNumberOfTappersChange(() => {
      this._reactToNumberOfTappersChange()
    })
    this._isUptodate = false
    this._lastValue = undefined
    this._dependents = new Set()
    this._peopleCare = false
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
      if (this._dataVerseContext === dv) return
      throw new Error(`This derivation already has a DataVerseContext, and it doesn't match what you're providing here`)
    }
  }

  _tick() {
    this._changeEmitter.emit(this.getValue())
  }

  _hasDependents() {
    return this._dependents.size !== 0
  }

  _addDependent(d: Derivation) {
    const hadDepsBefore = this._dependents.size > 0
    this._dependents.add(d)
    const hasDepsNow = this._dependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reevaluateWhetherPeopleCare()
    }
  }

  _removeDependent(d: Derivation) {
    const hadDepsBefore = this._dependents.size > 0
    this._dependents.delete(d)
    const hasDepsNow = this._dependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reevaluateWhetherPeopleCare()
    }
  }

  _youMayNeedToUpdateYourself(msgComingFrom?: mixed) {
    if (!this._isUptodate) return

    this._isUptodate = false
    if (this._hasDependents()) {
      this._dependents.forEach((d) => {d._youMayNeedToUpdateYourself(this)})
    }
    if (this._changeEmitter.hasTappers() && this._dataVerseContext) {
      this._dataVerseContext.addDerivationToUpdate(this)
    }
  }

  getValue(): $FixMe {
    if (!this._isUptodate) {
      const unboxed = this._recalculate()
      this._lastValue = unboxed
      this._isUptodate = true
    }
    return this._lastValue
  }

  _reactToNumberOfTappersChange() {
    if (this._changeEmitter.hasTappers() && !this._isUptodate && this._dataVerseContext) {
      this._dataVerseContext.addDerivationToUpdate(this)
    }

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

  map(fn: (oldVal: $FixMe) => $FixMe): Derivation {
    return new SimpleDerivation({dep: this}, (deps) => fn(deps.dep.getValue()))
  }

  flatMap(fn: (oldVal: $FixMe) => Derivation) {
    return this.map(fn).flatten()
  }

  flatten() {
    return new FlattenDerivation(this)
  }
}

const FlattenDerivation = require('./FlattenDerivation').default