// @flow
import * as React from 'react'
import {render} from 'react-dom'
import StudioRootComponent from './components/StudioRootComponent'
import LBCommunicator from './LBCommunicator'
import initialState from './initialState'
import * as DataVerse from '$shared/DataVerse'
import {runSaga} from 'redux-saga'
import rootSaga from './rootSaga'
import {type CoreState} from '$studio/types'
import coreComponents from '$studio/componentModel/coreComponents'

export default class TheStudioClass {
  _state: DataVerse.ReferencifyDeepObject<CoreState>
  _lbCommunicator: *

  constructor() {
    this._state = DataVerse.referencifyDeep({
      persistentState: initialState,
      coreComponents: coreComponents,
    })

    if (process.env.NODE_ENV === 'development' && module.hot) {
      module.hot.accept(
        '$studio/componentModel/coreComponents',
        () => {
          const newCoreComponents = require('$studio/componentModel/coreComponents').default
          this._state.set('coreComponents', DataVerse.referencifyDeep(newCoreComponents))
        }
      )
    }

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
      // $FixMe
      {
        subscribe(): Function {
          return () => {}
        },
        dispatch() {},
        getState() {},
      },
      rootSaga,
      // $FixMe
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

  getComponentDescriptor(componentID: string) {
    if (componentID.startsWith('TheaterJS/Core/')) {
      return this._state.getDeep(['componentDescriptors', 'core', componentID])
    } else {
      return this._state.getDeep(['componentDescriptors', 'custom', componentID])
    }
  }
}