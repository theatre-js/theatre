import Emitter from '../utils/Emitter'
import type {default as Tappable} from '../utils/Tappable'
import type {GraphNode, IDerivation} from './IDerivation'

export default class DerivationEmitter<V> {
  private _emitter: Emitter<V>
  private _lastValue: undefined | V
  private _lastValueRecorded: boolean
  private _hadTappers: boolean
  private _graphNode: GraphNode

  constructor(private readonly _derivation: IDerivation<V>) {
    this._emitter = new Emitter()
    this._graphNode = {
      height: 0,
      recalculate: () => {
        this._emit()
      },
    }
    this._emitter.onNumberOfTappersChange(() => {
      this._reactToNumberOfTappersChange()
    })
    this._hadTappers = false
    this._lastValueRecorded = false
    this._lastValue = undefined
    return this
  }

  private _reactToNumberOfTappersChange() {
    const hasTappers = this._emitter.hasTappers()
    if (hasTappers !== this._hadTappers) {
      this._hadTappers = hasTappers
      if (hasTappers) {
        this._derivation.addDependent(this._graphNode)
      } else {
        this._derivation.removeDependent(this._graphNode)
      }
    }
  }

  tappable(): Tappable<V> {
    return this._emitter.tappable
  }

  private _emit = () => {
    const newValue = this._derivation.getValue()
    if (newValue === this._lastValue && this._lastValueRecorded === true) return
    this._lastValue = newValue
    this._lastValueRecorded = true
    this._emitter.emit(newValue)
  }
}
