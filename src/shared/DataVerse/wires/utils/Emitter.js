// @flow
import Tappable from './Tappable'

type Tapper<V> = (v: V) => void
type Untap = () => void

export default class Emitter<V> {
  _tappers: *
  _lastTapperId: number
  tappable: Tappable<V>

  constructor() {
    this._lastTapperId = 0
    this._tappers = new Map()
    this.tappable = new Tappable({
      tapToSource: (cb: Tapper<V>) => {
        return this._tap(cb)
      },
    })
  }

  _tap(cb: Tapper<V>): Untap {
    const tapperId = this._lastTapperId++
    this._tappers.set(tapperId, cb)
    return () => {this._removeTapperById(tapperId)}
  }

  _removeTapperById(id: number) {
    this._tappers.delete(id)
  }

  emit(payload: V) {
    this._tappers.forEach((cb) => {cb(payload)})
  }

  hasTappers() {
    return this._tappers.size !== 0
  }
}