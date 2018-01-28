type Untap = () => void
type UntapFromSource = () => void


interface IProps<V> {
  tapToSource: (cb: (payload: V) => void) => UntapFromSource,
}

type Listener<V> = ((v: V) => void) | (() => void)

export default class Tappable<V> {
  _props: IProps<V>
  _tappers: Map<any, (v: V) => void>
  _untapFromSource: null | UntapFromSource
  _lastTapperId: number

  constructor(props: IProps<V>) {
    this._lastTapperId = 0
    this._untapFromSource = null
    this._props = props
    this._tappers = new Map()
  }

  _check() {
    if (this._untapFromSource) {
      if (this._tappers.size === 0) {
        this._untapFromSource()
        this._untapFromSource = null
      }
    } else {
      if (this._tappers.size !== 0) {
        this._untapFromSource = this._props.tapToSource(this._cb)
      }
    }
  }

  _cb: any = (arg: any): void => {
    this._tappers.forEach(cb => {
      cb(arg)
    })
  }

  tap(cb: Listener<V>): Untap {
    const tapperId = this._lastTapperId++
    this._tappers.set(tapperId, cb)
    this._check()
    return () => {
      this._removeTapperById(tapperId)
    }
  }

  tapImmediate(cb: Listener<V>): Untap {
    const ret = this.tap(cb)
    return ret
  }

  _removeTapperById(id: number) {
    this._tappers.delete(id)
  }

  map<T>(transform: (v: V) => T): Tappable<T> {
    return new Tappable({
      tapToSource: (cb: (v: T) => void) => {
        return this.tap((v: $IntentionalAny) => {
          return cb(transform(v))
        })
      },
    })
  }
}
