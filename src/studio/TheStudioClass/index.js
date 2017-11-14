// @flow
import * as React from 'react'
import {render} from 'react-dom'
import * as D from '$shared/DataVerse'
import LBCommunicator from './LBCommunicator'
import configureStore from './configureStore'
import StudioRootComponent from './components/StudioRootComponent'
import type {default as StandardStore} from '$lb/bootstrap/StandardStore'
import configureAtom from './configureAtom'

type Atom = $FixMe

export default class TheStudioClass {
  atom: Atom
  ticker: D.Ticker
  _lastComponentInstanceId: number
  _lbCommunicator: LBCommunicator
  store: StandardStore<*, *>

  constructor() {
    this._lastComponentInstanceId = 0
    this.ticker = new D.Ticker()
    this.store = configureStore()
    this.atom = configureAtom(this.store)

    // this._lbCommunicator = new LBCommunicator({
    //   backendUrl: `${window.location.protocol}//${window.location.hostname}:${process.env.studio.socketPort}`,
    // })
  }

  run() {
    const onAnimationFrame = () => {
      this.ticker.tick()
      window.requestAnimationFrame(onAnimationFrame)
    }
    window.requestAnimationFrame(onAnimationFrame)
    // this._lbCommunicator.getSocket().then(() => {
    //   this._lbCommunicator.request('ping', 'pingalu').then((res) => {
    //     console.log(res)
    //   })
    // })
    this.store.runRootSaga()

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
}
