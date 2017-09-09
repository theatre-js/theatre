// @flow
// import * as React from 'react'
// import {render} from 'react-dom'
// import StudioRootComponent from './components/StudioRootComponent'
import LBCommunicator from './LBCommunicator'
import initialState from './initialState'
import * as DataVerse from '$shared/DataVerse'
import {runSaga} from 'redux-saga'
import rootSaga from './rootSaga'
import {type CoreState} from '$studio/types'
import coreComponentDescriptors from '$studio/componentModel/coreComponentDescriptors'

export default class TheStudioClass {
  atom: $Call<typeof DataVerse.referencifyDeep, {state: CoreState, coreComponentDescriptors: typeof coreComponentDescriptors}>
  derivationContext: DataVerse.DerivationContext
  // _lbCommunicator: LBCommunicator

  constructor() {
    this.derivationContext = new DataVerse.DerivationContext()
    this.atom = DataVerse.referencifyDeep({
      state: initialState,
      coreComponentDescriptors,
    })

    if (process.env.NODE_ENV === 'development' && module.hot) {
      module.hot.accept(
        '$studio/componentModel/coreComponentDescriptors',
        () => {
          const newCoreComponentDescriptors = require('$studio/componentModel/coreComponentDescriptors').default
          this.atom.set('coreComponentDescriptors', DataVerse.referencifyDeep(newCoreComponentDescriptors))
        }
      )
    }

    // this._lbCommunicator = new LBCommunicator({
    //   backendUrl: `${window.location.protocol}//${window.location.hostname}:${process.env.studio.socketPort}`,
    // })
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

    // @todo
    // this._mountElement()
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

    // render(<StudioRootComponent studio={this} />, rootEl)
  }

  // getComponentDescriptor(componentID: string) {
  //   if (componentID.startsWith('TheaterJS/Core/')) {
  //     return this.atom.getDeep(['state', 'componentDescriptors', 'core', componentID])
  //   } else {
  //     return this.atom.getDeep(['state', 'componentDescriptors', 'custom', componentID])
  //   }
  // }
}