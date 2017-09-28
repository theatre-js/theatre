// @flow
import Emitter from '$shared/DataVerse/utils/Emitter'
import Context from '$shared/DataVerse/Context'
import {reportObservedDependency} from './autoDerivationDependentDiscoveryMechanism'

const FRESHNESS_STATE_NOT_APPLICABLE = 0
const FRESHNESS_STATE_STALE = 1
const FRESHNESS_STATE_FRESH = 2
type FreshnessState = typeof FRESHNESS_STATE_NOT_APPLICABLE | typeof FRESHNESS_STATE_STALE | typeof FRESHNESS_STATE_FRESH

let lastDerivationId = 0

export default class Derivation<V> {
  _id: number
  _changeEmitter: *
  _dataVerseContext: ?Context
  _freshnessState: FreshnessState
  _lastValue: ?V
  _dependents: Set<Derivation<$IntentionalAny>>
  _dependencies: Set<Derivation<$IntentionalAny>>
  +_recalculate: () => V
  _thereAreMoreThanOneTappersOrDependents: boolean
  getValue: () => V
  +_keepUptodate: () => void
  +_stopKeepingUptodate: () => void
  _didNotifyDownstreamOfUpcomingUpdate: boolean

  constructor() {
    this._didNotifyDownstreamOfUpcomingUpdate = false
    this._dependencies = new Set()
    this._id = lastDerivationId++

    this._dataVerseContext = null
    this._changeEmitter = new Emitter()
    this._changeEmitter.onNumberOfTappersChange(() => {
      this._reactToNumberOfTappersOrDependentsChange()
    })
    this._freshnessState = FRESHNESS_STATE_NOT_APPLICABLE
    this._lastValue = undefined
    this._thereAreMoreThanOneTappersOrDependents = false
    this._dependents = new Set()
  }

  _addDependency(d: Derivation<$IntentionalAny>) {
    if (this._dependencies.has(d)) return
    this._dependencies.add(d)
    if (this._thereAreMoreThanOneTappersOrDependents) d._addDependent(this)
  }

  _removeDependency(d: Derivation<$IntentionalAny>) {
    if (!this._dependencies.has(d)) return
    this._dependencies.delete(d)
    if (this._thereAreMoreThanOneTappersOrDependents) d._removeDependent(this)
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
      this._reactToNumberOfTappersOrDependentsChange()
    }
  }

  _removeDependent(d: Derivation<$IntentionalAny>) {
    const hadDepsBefore = this._dependents.size > 0
    this._dependents.delete(d)
    const hasDepsNow = this._dependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reactToNumberOfTappersOrDependentsChange()
    }
  }

  _youMayNeedToUpdateYourself(msgComingFrom?: Derivation<$IntentionalAny>) {
    if (this._didNotifyDownstreamOfUpcomingUpdate) return

    this._didNotifyDownstreamOfUpcomingUpdate = true
    this._freshnessState = FRESHNESS_STATE_STALE

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
    reportObservedDependency(this)

    if (this._freshnessState !== FRESHNESS_STATE_FRESH) {
      const unboxed = this._recalculate()
      this._lastValue = unboxed
      if (this._freshnessState === FRESHNESS_STATE_STALE) {
        this._freshnessState = FRESHNESS_STATE_FRESH
        this._didNotifyDownstreamOfUpcomingUpdate = false
      }
    }
    return (this._lastValue: $IntentionalAny)
  }

  _reactToNumberOfTappersOrDependentsChange() {
    const thereAreMoreThanOneTappersOrDependents =
      this._changeEmitter.hasTappers() || this._dependents.size > 0

    if (thereAreMoreThanOneTappersOrDependents === this._thereAreMoreThanOneTappersOrDependents) return
    this._thereAreMoreThanOneTappersOrDependents = thereAreMoreThanOneTappersOrDependents
    this._didNotifyDownstreamOfUpcomingUpdate = false

    if (thereAreMoreThanOneTappersOrDependents) {
      this._freshnessState = FRESHNESS_STATE_STALE
      this._keepUptodate()
      this._dependencies.forEach((d) => {d._addDependent(this)})
    } else {
      this._freshnessState = FRESHNESS_STATE_NOT_APPLICABLE
      this._stopKeepingUptodate()
      this._dependencies.forEach((d) => {d._removeDependent(this)})
    }
  }

  _keepUptodate() {}

  _stopKeepingUptodate() {}

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