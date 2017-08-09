// @flow
import React from 'react'
import {render} from 'react-dom'
import StudioRootComponent from './components/StudioRootComponent'
import configureStore from './configureStore'
import LBCommunicator from './LBCommunicator'

export default class TheStudioClass {
  _store: *
  _lbCommunicator: *

  constructor() {
    this._store = configureStore()
    this._lbCommunicator = new LBCommunicator({
      backendUrl: `${window.location.protocol}//${window.location.hostname}:${process.env.studio.socketPort}`})
  }

  run() {
    this._lbCommunicator.getSocket().then(() => {
      this._lbCommunicator.request('ping', 'pingalu').then((res) => {
        console.log(res)
      })
    })
    this._store.runRootSaga()
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

    render(<StudioRootComponent store={this._store} />, rootEl)
  }
}