// @flow
import * as React from 'react'
import {render} from 'react-dom'
import StudioRootComponent from './components/StudioRootComponent'
import LBCommunicator from './LBCommunicator'
import initialState from './initialState'
import * as D from '$shared/DataVerse'
import configureStore from './configureStore'
import type {default as StandardStore} from '$lb/bootstrap/StandardStore'
import coreComponentDescriptorsById from '$studio/componentModel/coreComponentDescriptors'
import coreModifierDescriptorsById from '$studio/componentModel/coreModifierDescriptors'

type Atom = $FixMe

export default class TheStudioClass {
  atom: Atom
  dataverseContext: D.Context
  _lastComponentInstanceId: number
  _lbCommunicator: LBCommunicator
  store: StandardStore<*, *>

  constructor() {
    this._lastComponentInstanceId = 0
    this.dataverseContext = new D.Context()
    this.store = configureStore()
    this.atom = configureAtom()

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
    this.store.runRootSaga()


    // @todo
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

  registerComponentInstance(isntanceId: number, componentInstance: React.Component<mixed, mixed>) {
    this.atom.prop('instances').setProp(isntanceId, componentInstance)
  }

  unregisterComponentInstance(isntanceId: number) {
    this.atom.prop('instances').deleteProp(isntanceId)
  }

}

const configureAtom = () => {
  const atom = D.atoms.atomifyDeep({
    state: initialState,
    coreComponentDescriptorsById,
    coreModifierDescriptorsById,
    instances: {},
  })

  // debugger
  atom.deepChanges().tap((dc) => {
    console.log('deepChangeFromAtom', dc)
  })

  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept(
      '$studio/componentModel/coreComponentDescriptors',
      () => {
        const newCoreComponentDescriptors = require('$studio/componentModel/coreComponentDescriptors').default
        atom.setProp('coreComponentDescriptorsById', D.atoms.atomifyDeep(newCoreComponentDescriptors))
      }
    )

    // $FixMe
    module.hot.accept(
      '$studio/componentModel/coreModifierDescriptors',
      () => {
        const newModifierDescriptors = require('$studio/componentModel/coreModifierDescriptors').default
        atom.setProp('coreModifierDescriptorsById', D.atoms.atomifyDeep(newModifierDescriptors))
      }
    )
  }

  return atom
}