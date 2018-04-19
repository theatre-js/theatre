import React from 'react'
import {render} from 'react-dom'
import LBCommunicator from '$studio/commsWithLB/LBCommunicator'
import configureStore from './configureStore'
import StudioRootComponent from './components/StudioRootComponent'
import {default as StoreAndStuff} from '$lb/bootstrap/StoreAndStuff'
import configureAtom from './configureAtom'
import Ticker from '$shared/DataVerse/Ticker'
import {reduceAhistoricState} from '$studio/bootstrap/actions'
import StatePersistor from '$studio/statePersistence/StatePersistor'
import {IStudioStoreState} from '$studio/types'
import MirrorOfReactTree from '$studio/integrations/react/treeMirroring/MirrorOfReactTree'
import {Atomify} from '$shared/DataVerse/atoms/atomifyDeep'
import {PointerDerivation} from '$shared/DataVerse/derivations/pointer'
import AbstractDerivedDict from '$shared/DataVerse/derivations/dicts/AbstractDerivedDict'
import {UnwrapDictAtom} from '$shared/DataVerse/atoms/dictAtom'
import configureAtom2 from '$studio/bootstrap/configureAtom2'
import {Atom} from '$shared/DataVerse2/atom'
import ElementTree from './ElementTree'

export type StudioStateAtom = Atomify<IStudioStoreState>

export default class Studio {
  elementTree: ElementTree;
  atom2: Atom<IStudioStoreState>
  _statePersistor: StatePersistor
  _ran: boolean
  atom: StudioStateAtom
  atomP: PointerDerivation<AbstractDerivedDict<UnwrapDictAtom<StudioStateAtom>>>
  ticker: Ticker
  _lbCommunicator: LBCommunicator
  store: StoreAndStuff<IStudioStoreState, $FixMe>
  // _mirrorOfReactTree: MirrorOfReactTree

  constructor() {
    this._ran = false
    this.ticker = new Ticker()
    // this._mirrorOfReactTree = new MirrorOfReactTree()
    this.elementTree = new ElementTree(this)
    this.store = configureStore()
    this.atom = configureAtom(this.store)
    this.atomP = this.atom.derivedDict().pointer()
    this.atom2 = configureAtom2(this.store)
    this._lbCommunicator = new LBCommunicator({
      lbUrl: `${window.location.protocol}//${window.location.hostname}:${
        process.env.studio.socketPort
      }`,
    })
    this._statePersistor = new StatePersistor(this)
    this.store.runRootSaga(this)

    this._lbCommunicator.getSocket()
  }

  run(pathToProject: string) {
    if (this._ran)
      throw new Error(`TheaterJS.run() has already been called once`)
    this._ran = true

    this.store.reduxStore.dispatch(
      reduceAhistoricState(['pathToProject'], () => pathToProject),
    )

    const onAnimationFrame = () => {
      this.ticker.tick()
      window.requestAnimationFrame(onAnimationFrame)
    }
    window.requestAnimationFrame(onAnimationFrame)
    // this._lbCommunicator.getSocket().then(() => {
    //   this._lbCommunicator.request('ping', 'pingalu').then((res) => {
    //     console.log('res', res)
    //   })
    // })

    this._mountElement()
  }

  _mountElement() {
    const rootEl = document.createElement('div')
    rootEl.id = 'theaterjs-studio'
    if (document.body) {
      document.body.appendChild(rootEl)
    } else {
      // @todo This error message is very confusing. Let's rewrite it so that it
      // would tell the user exactly what they have to do to fix it.
      throw new Error(`Where is the <body> tag?`)
    }

    render(<StudioRootComponent studio={this} />, rootEl)
  }

  


}
