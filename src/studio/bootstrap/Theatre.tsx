import Ticker from '$shared/DataVerse/Ticker'
import {Atomify} from '$shared/DataVerse/deprecated/atoms/atomifyDeep'
import {UnwrapDictAtom} from '$shared/DataVerse/deprecated/atoms/dictAtom'
import AbstractDerivedDict from '$shared/DataVerse/deprecated/atomDerivations/dicts/AbstractDerivedDict'
import {PointerDerivation} from '$shared/DataVerse/derivations/pointer'
import {Atom} from '$shared/DataVerse/atom'
import Studio from '$studio/bootstrap/TheatreStudio'
import atomFromReduxStore from '$shared/utils/redux/atomFromReduxStore'
import {ITheatreStoreState} from '$studio/types'
import {Store} from 'redux'
import configureAtom from './configureAtom'
import configureStore from '$shared/utils/redux/configureStore'
import rootReducer from './rootReducer'

export type TheatreStateAtom = Atomify<ITheatreStoreState>

type Options = {}

export default class Theatre {
  atom2: Atom<ITheatreStoreState>
  _ran: boolean
  atom: TheatreStateAtom
  atomP: PointerDerivation<
    AbstractDerivedDict<UnwrapDictAtom<TheatreStateAtom>>
  >
  ticker: Ticker
  store: Store<ITheatreStoreState>
  studio: Studio

  constructor(readonly _options: Options) {
    this._ran = false
    this.ticker = new Ticker()
    this.store = configureStore({rootReducer}) as $FixMe
    this.atom = configureAtom(this.store)
    this.atomP = this.atom.derivedDict().pointer()
    this.atom2 = atomFromReduxStore(this.store)

    if ($env.NODE_ENV === 'development' && module.hot) {
      // @todo
      // module.hot.accept('./rootReducer', () => {
      //   const r: $IntentionalAny = require
      //   store.dispatch(
      //     multiReduceStateAction([
      //       {
      //         path: ['componentModel', 'modifierDescriptors', 'core'],
      //         reducer: () =>
      //           r(
      //             '$studio/componentModel/coreModifierDescriptors/coreModifierDescriptors',
      //           ).default,
      //       },
      //       {
      //         path: ['componentModel', 'componentDescriptors', 'core'],
      //         reducer: () =>
      //           r(
      //             '$studio/componentModel/coreComponentDescriptors/coreComponentDescriptors',
      //           ).default,
      //       },
      //     ]),
      //   )
      // })
    }
  }

  _setStudio(studio: Studio) {
    this.studio = studio
  }

  run(pathToProject: string) {
    if (this._ran)
      throw new Error(`TheatreJS.run() has already been called once`)

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
