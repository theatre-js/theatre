import type Ticker from '../Ticker'
import Tappable from '../utils/Tappable'
import AbstractDerivation from './AbstractDerivation'
import type {IDerivation} from './IDerivation'

const UNDETERMINED = Symbol()
// Exporting from a function because of the circular dependency with AbstractDerivation
const makeDistinctDerivationClass = () =>
  class DistinctDerivation<T> extends AbstractDerivation<T> {
    private _lastValCompare: T | typeof UNDETERMINED = UNDETERMINED

    constructor(
      private readonly _dep: IDerivation<T>,
      private readonly _eq?: (a: T, b: T) => boolean,
    ) {
      super()
      this._addDependency(this._dep)
    }

    _recalculate() {
      return this._dep.getValue()
    }

    protected _reactToDependencyBecomingStale(
      which: IDerivation<unknown>,
    ): void {
      if (this._lastValCompare === UNDETERMINED) {
        this._lastValCompare = this._dep.getValue()
        console.log('_reactToDependencyBecomingStale determined')
        return
      }

      if (which === this._dep) {
        const newValue = this._dep.getValue()
        const lastValue = this._lastValue

        if (
          this._eq?.(newValue, this._lastValCompare) ??
          newValue === this._lastValue
        ) {
          this._didMarkDependentsAsStale = true
          // console.log('_reactToDependencyBecomingStale', newValue, lastValue, {
          //   _didMarkDependentsAsStale: this._didMarkDependentsAsStale,
          // })
        } else {
          this._lastValue = newValue
        }

        this._lastValCompare = newValue
      }
    }

    /**
     * Returns a `Tappable` of the changes of this derivation.
     */
    override changes(ticker: Ticker): Tappable<T> {
      return distinctTappable(this._dep.changes(ticker), this._eq)
    }

    /**
     * Keep the derivation hot, even if there are no tappers (subscribers).
     */
    override keepHot(): () => void {
      throw new Error("Not implemented: can't keep a distinct hot")
    }
  }

let cls: ReturnType<typeof makeDistinctDerivationClass> | undefined = undefined

function distinctTappable<T>(
  from: Tappable<T>,
  eq?: (a: T, b: T) => boolean,
): Tappable<T> {
  let lastValue: T | typeof UNDETERMINED = UNDETERMINED
  return new Tappable({
    tapToSource(cb) {
      return from.tap((value) => {
        if (
          lastValue !== UNDETERMINED &&
          (eq == null ? value === lastValue : eq(value, lastValue))
        ) {
          return
        }

        lastValue = value
        return cb(value)
      })
    },
  })
}

export default function distinct<V>(
  dep: IDerivation<V>,
  eq?: (a: V, b: V) => boolean,
): IDerivation<V> {
  if (!cls) {
    cls = makeDistinctDerivationClass()
  }
  return new cls(dep, eq)
}
