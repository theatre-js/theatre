import configureStore from './configureStore'
import {default as StoreAndStuff} from '$lb/bootstrap/StoreAndStuff'
import configureAtom from './configureAtom'
import Ticker from '$shared/DataVerse/Ticker'
import {ITheaterStoreState} from '$theater/types'
import {Atomify} from '$shared/DataVerse/atoms/atomifyDeep'
import {PointerDerivation} from '$shared/DataVerse/derivations/pointer'
import AbstractDerivedDict from '$shared/DataVerse/derivations/dicts/AbstractDerivedDict'
import {UnwrapDictAtom} from '$shared/DataVerse/atoms/dictAtom'
import configureAtom2 from '$theater/bootstrap/configureAtom2'
import {Atom} from '$shared/DataVerse2/atom'
import Studio from './Studio'

export type TheaterStateAtom = Atomify<ITheaterStoreState>

type Options = {
  withStudio: boolean
}

export default class Theater {
  atom2: Atom<ITheaterStoreState>
  _ran: boolean
  atom: TheaterStateAtom
  atomP: PointerDerivation<AbstractDerivedDict<UnwrapDictAtom<TheaterStateAtom>>>
  ticker: Ticker
  store: StoreAndStuff<ITheaterStoreState, $FixMe>
  studio: Studio

  constructor(readonly _options: Options) {
    this._ran = false
    this.ticker = new Ticker()
    this.store = configureStore()
    this.atom = configureAtom(this.store)
    this.atomP = this.atom.derivedDict().pointer()
    this.atom2 = configureAtom2(this.store)
    if (_options.withStudio) {
      this.studio = new Studio(this)
    }
  }

  run(pathToProject: string) {
    if (this._ran)
      throw new Error(`TheaterJS.run() has already been called once`)

    this._ran = true

    const onAnimationFrame = () => {
      this.studio && this.studio._tick()
      this.ticker.tick()
      window.requestAnimationFrame(onAnimationFrame)
    }
    window.requestAnimationFrame(onAnimationFrame)

    if (this.studio) {
      this.studio._run(pathToProject)
    }
  }
}
