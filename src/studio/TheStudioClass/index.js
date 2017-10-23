// @flow
import * as React from 'react'
// import {render} from 'react-dom'
// import StudioRootComponent from './components/StudioRootComponent'
// import LBCommunicator from './LBCommunicator'
import initialState from './initialState'
import * as D from '$shared/DataVerse'
import {runSaga} from 'redux-saga'
import rootSaga from './rootSaga'
import type {CoreState} from '../types'
// import {type CoreState} from '$studio/types'
import coreComponentDescriptorsById from '$studio/componentModel/coreComponentDescriptors'
import coreModifierDescriptorsById from '$studio/componentModel/coreModifierDescriptors'

type Atom = D.AtomifyDeepType<D.ObjectLiteral<{
  state: CoreState,
  coreComponentDescriptorsById: D.ObjectLiteral<{[key: string]: $FixMe}>,
  coreModifierDescriptorsById: D.ObjectLiteral<{[key: string]: $FixMe}>,
  instances: D.ObjectLiteral<{[key: string | number]: $FixMe}>,
}>>

export default class TheStudioClass {
  atom: Atom
  dataverseContext: D.Context
  _lastComponentInstanceId: number
  // _lbCommunicator: LBCommunicator

  constructor() {
    this._lastComponentInstanceId = 0
    this.dataverseContext = new D.Context()
    this.atom = D.atoms.atomifyDeep(D.literals.object({
      state: initialState,
      coreComponentDescriptorsById,
      coreModifierDescriptorsById,
      instances: D.literals.object({}),
    }))

    // debugger
    this.atom.deepChanges().tap((dc) => {
      console.log(dc)
    })

    if (process.env.NODE_ENV === 'development' && module.hot) {
      module.hot.accept(
        '$studio/componentModel/coreComponentDescriptors',
        () => {
          const newCoreComponentDescriptors = require('$studio/componentModel/coreComponentDescriptors').default
          this.atom.setProp('coreComponentDescriptorsById', D.atoms.atomifyDeep(newCoreComponentDescriptors))
        }
      )

      // $FixMe
      module.hot.accept(
        '$studio/componentModel/coreModifierDescriptors',
        () => {
          const newModifierDescriptors = require('$studio/componentModel/coreModifierDescriptors').default
          this.atom.setProp('coreModifierDescriptorsById', D.atoms.atomifyDeep(newModifierDescriptors))
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