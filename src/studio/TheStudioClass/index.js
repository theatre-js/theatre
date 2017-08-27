// @flow
import * as React from 'react'
import {render} from 'react-dom'
import StudioRootComponent from './components/StudioRootComponent'
import LBCommunicator from './LBCommunicator'
import initialState from './initialState'
import DataVerse from '$shared/DataVerse'
import {runSaga} from 'redux-saga'
import rootSaga from './rootSaga'

export default class TheStudioClass {
  atom: *
  _lbCommunicator: *

  constructor() {
    this.atom = DataVerse.fromJS(initialState)
    this._lbCommunicator = new LBCommunicator({
      backendUrl: `${window.location.protocol}//${window.location.hostname}:${process.env.studio.socketPort}`,
    })
  }

  run() {
    // this._lbCommunicator.getSocket().then(() => {
    //   this._lbCommunicator.request('ping', 'pingalu').then((res) => {
    //     console.log(res)
    //   })
    // })
    runSaga(
      // $FlowFixMe
      {
        subscribe(): Function {
          return () => {}
        },
        dispatch() {},
        getState() {},
      },
      rootSaga,
      // $FlowFixMe
      this,
    )

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