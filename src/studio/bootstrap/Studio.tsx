import * as React from 'react'
import {render} from 'react-dom'
import LBCommunicator from './LBCommunicator'
import configureStore from './configureStore'
import StudioRootComponent from './components/StudioRootComponent'
import {default as StoreAndStuff} from '$lb/bootstrap/StoreAndStuff'
import configureAtom from './configureAtom'
import Ticker from '$src/shared/DataVerse/Ticker'
import {runStudio} from './rootSaga'

type Atom = $FixMe

export default class Studio {
  _ran: boolean
  componentInstances: Map<number, React.ComponentType>
  atom: Atom
  ticker: Ticker
  _lastComponentInstanceId: number
  _lbCommunicator: LBCommunicator
  store: StoreAndStuff<$FixMe, $FixMe>

  constructor() {
    this._ran = false
    this._lastComponentInstanceId = 0
    this.ticker = new Ticker()
    this.store = configureStore()
    this.atom = configureAtom(this.store)
    this.componentInstances = new Map()
    this._lbCommunicator = new LBCommunicator({
      backendUrl: `${window.location.protocol}//${window.location.hostname}:${
        process.env.studio.socketPort
      }`,
    })
    this.store.runRootSaga(this)

    this._lbCommunicator.getSocket()
  }

  run(projectPath: string) {
    if (this._ran)
      throw new Error(`TheaterJS.run() has already been called once`)
    this._ran = true

    this.store.runSaga(runStudio, projectPath)

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

  _getNewComponentInstanceId() {
    return this._lastComponentInstanceId++
  }

  declareComponentInstance(id: number, instance: React.ComponentType) {
    this.componentInstances.set(id, instance)
  }

  undeclareComponentInstance(id: number) {
    this.componentInstances.delete(id)
  }
}
