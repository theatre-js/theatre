// @flow
import * as React from 'react'
// import {render} from 'react-dom'
// import StudioRootComponent from './components/StudioRootComponent'
// import LBCommunicator from './LBCommunicator'
import initialState from './initialState'
import * as D from '$shared/DataVerse'
import {runSaga} from 'redux-saga'
import rootSaga from './rootSaga'
// import {type CoreState} from '$studio/types'
import coreComponentDescriptorsById from '$studio/componentModel/coreComponentDescriptors'

export default class TheStudioClass {
  atom: * // $Call<typeof D.atomifyDeep, {state: CoreState, coreComponentDescriptors: typeof coreComponentDescriptors}>
  dataverseContext: D.Context
  _lastComponentInstanceId: number
  // _lbCommunicator: LBCommunicator

  constructor() {
    this._lastComponentInstanceId = 0
    this.dataverseContext = new D.Context()
    this.atom = D.atoms.atomifyDeep(D.literals.object({
      state: initialState,
      coreComponentDescriptorsById,
      instances: D.literals.object({}),
    }))

    if (process.env.NODE_ENV === 'development' && module.hot) {
      module.hot.accept(
        '$studio/componentModel/coreComponentDescriptors',
        () => {
          const newCoreComponentDescriptors = require('$studio/componentModel/coreComponentDescriptors').default
          this.atom.setProp('coreComponentDescriptorsById', D.atoms.atomifyDeep(newCoreComponentDescriptors))
        }
      )
    }

    // this._lbCommunicator = new LBCommunicator({
    //   backendUrl: `${window.location.protocol}//${window.location.hostname}:${process.env.studio.socketPort}`,
    // })
  }

  run() {
    const onAnimationFrame = () => {
      this.dataverseContext.tick()
      window.requestAnimationFrame(onAnimationFrame)
    }
    window.requestAnimationFrame(onAnimationFrame)
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

  _getNewComponentInstanceId() {
    return this._lastComponentInstanceId++
  }

  registerComponentInstance(isntanceId: number, componentInstance: React.Component<mixed, mixed>) {
    // $FixMe
    this.atom.prop('instances').setProp(isntanceId, componentInstance)
  }

  unregisterComponentInstance(isntanceId: number) {
    // $FixMe
    this.atom.prop('instances').deleteProp(isntanceId)
  }
}