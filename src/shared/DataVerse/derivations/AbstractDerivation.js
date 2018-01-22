// @flow
import type {ITicker} from '$shared/DataVerse/Ticker'
import {reportObservedDependency} from './autoDerive/discoveryMechanism'
import type {IDerivation} from './types'
// import {mapStackTrace} from 'sourcemapped-stacktrace'
import {default as DerivationEmitter} from './DerivationEmitter'
import * as debug from '$shared/debug'

const FRESHNESS_STATE_NOT_APPLICABLE = 0
const FRESHNESS_STATE_STALE = 1
const FRESHNESS_STATE_FRESH = 2
type FreshnessState =
  | typeof FRESHNESS_STATE_NOT_APPLICABLE
  | typeof FRESHNESS_STATE_STALE
  | typeof FRESHNESS_STATE_FRESH

class AbstractDerivation {
  _id: number
  isDerivation = 'True'
  _didNotifyDownstreamOfUpcomingUpdate: boolean
  _thereAreMoreThanOneDependents: boolean

  _freshnessState: FreshnessState
  _lastValue: $FixMe
  _dependents: *
  _dependencies: *
  _trace: $FixMe
  +_recalculate: () => $FixMe
  +_keepUptodate: () => void
  +_stopKeepingUptodate: () => void
  +_youMayNeedToUpdateYourself: (
    msgComingFrom: IDerivation<$IntentionalAny>,
  ) => void

  constructor() {
    if (process.env.KEEPING_DERIVATION_TRACES === true) {
      this._trace = new Error('trace')
    }
    this._didNotifyDownstreamOfUpcomingUpdate = false
    this._id = lastDerivationId++
    this._freshnessState = FRESHNESS_STATE_NOT_APPLICABLE
    this._lastValue = undefined
    this._thereAreMoreThanOneDependents = false
    this._dependencies = new Set()
    this._dependents = new Set()
  }

  _addDependency(d: IDerivation<$IntentionalAny>) {
    if (this._dependencies.has(d)) return
    this._dependencies.add(d)
    if (this._thereAreMoreThanOneDependents) d._addDependent((this: $FixMe))
  }

  _removeDependency(d: IDerivation<$IntentionalAny>) {
    if (!this._dependencies.has(d)) return
    this._dependencies.delete(d)
    if (this._thereAreMoreThanOneDependents) d._removeDependent((this: $FixMe))
  }

  _removeAllDependencies() {
    this._dependencies.forEach(d => {
      this._removeDependency(d)
    })
  }

  changes(ticker: ITicker) {
    return new DerivationEmitter((this: $IntentionalAny), ticker).tappable()
  }

  tapImmediate(ticker: ITicker, fn: $FixMe => void): $FixMe {
    const untap = this.changes(ticker).tap(fn)
    fn(this.getValue())
    return untap
  }

  _hasDependents() {
    return this._dependents.size !== 0
  }

  _addDependent(d: IDerivation<$IntentionalAny>) {
    const hadDepsBefore = this._dependents.size > 0
    this._dependents.add(d)
    const hasDepsNow = this._dependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reactToNumberOfDependentsChange()
    }
  }

  _removeDependent(d: IDerivation<$IntentionalAny>) {
    const hadDepsBefore = this._dependents.size > 0
    this._dependents.delete(d)
    const hasDepsNow = this._dependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reactToNumberOfDependentsChange()
    }
  }

  _youMayNeedToUpdateYourself() {
    if (this._didNotifyDownstreamOfUpcomingUpdate) return

    this._didNotifyDownstreamOfUpcomingUpdate = true
    this._freshnessState = FRESHNESS_STATE_STALE

    if (this._hasDependents()) {
      this._dependents.forEach(dependent => {
        dependent._youMayNeedToUpdateYourself((this: $FixMe))
      })
    }
  }

  getValue() {
    reportObservedDependency((this: $FixMe))

    if (
      process.env.TRACKING_COLD_DERIVATIONS === true &&
      debug.findingColdDerivations &&
      !debug.skippingColdDerivations &&
      this._freshnessState === FRESHNESS_STATE_NOT_APPLICABLE
    ) {
      console.warn(`Perf regression: Unexpected cold derivation read`)
    }

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

  _reactToNumberOfDependentsChange() {
    const thereAreMoreThanOneDependents = this._dependents.size > 0

    if (thereAreMoreThanOneDependents === this._thereAreMoreThanOneDependents)
      return
    // if (thereAreMoreThanOneDependents) {
    //   activeDs.add(this)
    // } else {
    //   activeDs.delete(this)
    // }

    this._thereAreMoreThanOneDependents = thereAreMoreThanOneDependents
    this._didNotifyDownstreamOfUpcomingUpdate = false

    if (thereAreMoreThanOneDependents) {
      this._freshnessState = FRESHNESS_STATE_STALE
      this._dependencies.forEach(d => {
        d._addDependent((this: $FixMe))
      })
      this._keepUptodate()
    } else {
      this._freshnessState = FRESHNESS_STATE_NOT_APPLICABLE
      this._dependencies.forEach(d => {
        d._removeDependent((this: $FixMe))
      })
      this._stopKeepingUptodate()
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

  toJS() {
    return this.flatMap(toJS.default)
  }
}

export default (AbstractDerivation: $FixMe)
const flattenDeep = require('./flattenDeep')
const flatMapDerivation = require('./flatMapDerivation')
const mapDerivation = require('./mapDerivation')
const toJS = require('./toJS')

let lastDerivationId = 0
// setInterval(() => {
//   console.log(lastDerivationId, activeDs.size)
// }, 2000)
// let activeDs = new Set()
// import toCsv from 'json2csv'

// setTimeout(() => {console.log('allDs', lastDerivationId)}, 1500)
// setTimeout(() => {
//   // debugger
//   console.log('activeDs  ', activeDs.size)
//   console.log('allDs', lastDerivationId)
//   let activePointerDs = 0
//   activeDs.forEach((d) => {
//     if (d.inPointer === true) activePointerDs++
//   })
//   console.log('activePointerDs', activePointerDs)
// }, 1000)
//   const nodes = []
//   const edges = []

//   activeDs.forEach((d) => {
//     const node = {
//       id: d._id,
//       type: d.constructor.name,
//       hasTappers: d._changeEmitter.hasTappers(),
//     }

//     nodes.push(node)

//     d._dependents.forEach((dep) => {
//       edges.push({from: d._id, to: dep._id})
//     })
//   })

//   const nodesBlob = new Blob(
//     [toCsv({data: nodes, fields: ['id', 'type', 'hasTappers']})],
//     {type: 'text/plain'},
//   )

//   const edgesBlob = new Blob(
//     [toCsv({data: edges, fields: ['from', 'to']})],
//     {type: 'text/plain'},
//   )

//   window.open(window.URL.createObjectURL(nodesBlob))
//   window.open(window.URL.createObjectURL(edgesBlob))
// }, 2000)
