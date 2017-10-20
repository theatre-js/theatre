// @flow
import Emitter from '$shared/DataVerse/utils/Emitter'
import Context from '$shared/DataVerse/Context'
import {reportObservedDependency} from './autoDerive/discoveryMechanism'
import type {IDerivation} from './types'
import toCsv from 'json2csv'
// import {mapStackTrace} from 'sourcemapped-stacktrace'

const FRESHNESS_STATE_NOT_APPLICABLE = 0
const FRESHNESS_STATE_STALE = 1
const FRESHNESS_STATE_FRESH = 2
type FreshnessState = typeof FRESHNESS_STATE_NOT_APPLICABLE | typeof FRESHNESS_STATE_STALE | typeof FRESHNESS_STATE_FRESH

let lastDerivationId = 0
let activeDs = new Set()

// setTimeout(() => {console.log('allDs', lastDerivationId)}, 1500)
setTimeout(() => {
  console.log('activeDs  ', activeDs.size)
  console.log('allDs', lastDerivationId)
  // const nodes = []
  // const edges = []
  // connections
  // activeDs.forEach((d) => {
  //   const node = {
  //     id: d._id,
  //     type: d.constructor.name,
  //     hasTappers: d._changeEmitter.hasTappers(),
  //   }

  //   nodes.push(node)

  //   d._dependents.forEach((dep) => {
  //     edges.push({from: d._id, to: dep._id})
  //   })
  // })

  // const nodesBlob = new Blob(
  //   [toCsv({data: nodes, fields: ['id', 'type', 'hasTappers']})],
  //   {type: 'text/plain'},
  // )

  // const edgesBlob = new Blob(
  //   [toCsv({data: edges, fields: ['from', 'to']})],
  //   {type: 'text/plain'},
  // )

  // window.open(window.URL.createObjectURL(nodesBlob))
  // window.open(window.URL.createObjectURL(edgesBlob))
}, 200)

class AbstractDerivation {
  _id: number
  isDerivation = 'True'
  _didNotifyDownstreamOfUpcomingUpdate: boolean
  _thereAreMoreThanOneTappersOrDependents: boolean

  _changeEmitter: Emitter<*>
  _dataVerseContext: ?Context
  _freshnessState: FreshnessState
  _lastValue: $FixMe
  _dependents: *
  _dependencies: *
  setDataVerseContext: *
  _trace: $FixMe
  +_recalculate: () => $FixMe
  +_keepUptodate: () => void
  +_stopKeepingUptodate: () => void
  +_youMayNeedToUpdateYourself: (msgComingFrom: IDerivation<$IntentionalAny>) => void

  constructor() {
    this._trace = new Error('trace')
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

  _addDependency(d: IDerivation<$IntentionalAny>) {
    if (this._dependencies.has(d)) return
    this._dependencies.add(d)
    if (this._thereAreMoreThanOneTappersOrDependents) d._addDependent((this: $FixMe))
  }

  _removeDependency(d: IDerivation<$IntentionalAny>) {
    if (!this._dependencies.has(d)) return
    this._dependencies.delete(d)
    if (this._thereAreMoreThanOneTappersOrDependents) d._removeDependent((this: $FixMe))
  }

  _removeAllDependencies() {
    this._dependencies.forEach((d) => {this._removeDependency(d)})
  }

  changes() {
    if (!this._dataVerseContext)
      throw new Error(`Can't have tappers without a DataVerseContext set first`)

    return this._changeEmitter.tappable
  }

  setDataVerseContext(dv: Context): $FixMe {
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

  _addDependent(d: IDerivation<$IntentionalAny>) {
    const hadDepsBefore = this._dependents.size > 0
    this._dependents.add(d)
    const hasDepsNow = this._dependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reactToNumberOfTappersOrDependentsChange()
    }
  }

  _removeDependent(d: IDerivation<$IntentionalAny>) {
    const hadDepsBefore = this._dependents.size > 0
    this._dependents.delete(d)
    const hasDepsNow = this._dependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reactToNumberOfTappersOrDependentsChange()
    }
  }

  _youMayNeedToUpdateYourself(msgComingFrom: IDerivation<$IntentionalAny>) {
    if (this._didNotifyDownstreamOfUpcomingUpdate) return

    this._didNotifyDownstreamOfUpcomingUpdate = true
    this._freshnessState = FRESHNESS_STATE_STALE

    if (this._hasDependents()) {
      this._dependents.forEach((dependent) => {
        dependent._youMayNeedToUpdateYourself((this: $FixMe))
      })

    }
    if (this._changeEmitter.hasTappers() && this._dataVerseContext) {
      this._dataVerseContext.addDerivationToUpdate((this: $FixMe))
    }
  }

  getValue() {
    reportObservedDependency((this: $FixMe))

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
    if (thereAreMoreThanOneTappersOrDependents) {
      activeDs.add(this)
    } else {
      activeDs.delete(this)
    }
    // activeDs = thereAreMoreThanOneTappersOrDependents ? activeDs + 1 : activeDs - 1
    this._thereAreMoreThanOneTappersOrDependents = thereAreMoreThanOneTappersOrDependents
    this._didNotifyDownstreamOfUpcomingUpdate = false

    if (thereAreMoreThanOneTappersOrDependents) {
      this._freshnessState = FRESHNESS_STATE_STALE
      this._keepUptodate()
      this._dependencies.forEach((d) => {d._addDependent((this: $FixMe))})
    } else {
      this._freshnessState = FRESHNESS_STATE_NOT_APPLICABLE
      this._stopKeepingUptodate()
      this._dependencies.forEach((d) => {d._removeDependent((this: $FixMe))})
    }
  }

  _keepUptodate() {}

  _stopKeepingUptodate() {}

  map<T>(fn: $FixMe): IDerivation<T> {
    // $FixMe
    return mapDerivation.default(this, fn)
  }

  flatMap(fn: $FixMe): $FixMe {
    return flatMapDerivation.default(this, fn)
    // return  this.map(fn).flatten()
  }

  flatten(): IDerivation<$FixMe> {
    return this.flattenDeep(1)
  }

  flattenDeep(levels?: number): IDerivation<$FixMe> {
    // $FixMe
    return flattenDeep.default((this: $FixMe), levels)
  }

  tapImmediate(fn: ($FixMe) => void): $FixMe {
    const untap = this.changes().tap(fn)
    fn(this.getValue())
    return untap
  }
}

export default (AbstractDerivation: $FixMe)
const flattenDeep = require('./flattenDeep')
const flatMapDerivation = require('./flatMapDerivation')
const mapDerivation = require('./mapDerivation')