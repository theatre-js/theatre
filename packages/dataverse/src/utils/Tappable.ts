type Untap = () => void
type UntapFromSource = () => void

interface IProps<V> {
  tapToSource: (cb: (payload: V) => void) => UntapFromSource
}

type Listener<V> = ((v: V) => void) | (() => void)

/**
 * Represents a data-source that can be tapped (subscribed to).
 */
export default class Tappable<V> {
  private _props: IProps<V>
  private _tappers: Map<number, {bivarianceHack(v: V): void}['bivarianceHack']>
  private _untapFromSource: null | UntapFromSource
  private _lastTapperId: number
  private _untapFromSourceTimeout: null | NodeJS.Timer = null

  constructor(props: IProps<V>) {
    this._lastTapperId = 0
    this._untapFromSource = null
    this._props = props
    this._tappers = new Map()
  }

  private _check() {
    if (this._untapFromSource) {
      if (this._tappers.size === 0) {
        this._scheduleToUntapFromSource()
        /*
         * this._untapFromSource()
         * this._untapFromSource = null
         */
      }
    } else {
      if (this._tappers.size !== 0) {
        this._untapFromSource = this._props.tapToSource(this._cb)
      }
    }
  }

  private _scheduleToUntapFromSource() {
    if (this._untapFromSourceTimeout !== null) return
    this._untapFromSourceTimeout = setTimeout(() => {
      this._untapFromSourceTimeout = null
      if (this._tappers.size === 0) {
        this._untapFromSource!()

        this._untapFromSource = null
      }
    }, 0)
  }

  private _cb: any = (arg: any): void => {
    this._tappers.forEach((cb) => {
      cb(arg)
    })
  }

  /**
   * Tap (subscribe to) the data source.
   *
   * @param cb - The callback to be called on a change.
   */
  tap(cb: Listener<V>): Untap {
    const tapperId = this._lastTapperId++
    this._tappers.set(tapperId, cb)
    this._check()
    return () => {
      this._removeTapperById(tapperId)
    }
  }

  /*
   * tapImmediate(cb: Listener<V>): Untap {
   *   const ret = this.tap(cb)
   *   return ret
   * }
   */

  private _removeTapperById(id: number) {
    this._tappers.delete(id)
    this._check()
  }

  // /**
  //  * @deprecated
  //  */
  // map<T>(transform: {bivarianceHack(v: V): T}['bivarianceHack']): Tappable<T> {
  //   return new Tappable({
  //     tapToSource: (cb: (v: T) => void) => {
  //       return this.tap((v: $IntentionalAny) => {
  //         return cb(transform(v))
  //       })
  //     },
  //   })
  // }
}
