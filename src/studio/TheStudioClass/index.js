// @flow
import * as React from 'react'
import {render} from 'react-dom'
import * as D from '$shared/DataVerse'
import LBCommunicator from './LBCommunicator'
import configureStore from './configureStore'
import StudioRootComponent from './components/StudioRootComponent'
import type {default as StandardStore} from '$lb/bootstrap/StandardStore'
import jsonPatchLib from 'fast-json-patch'

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
    this.atom = this._configureAtom()

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

  _configureAtom() {
    let lastState = this.store.reduxStore.getState()
    const atom = D.atoms.atomifyDeep(lastState)

    // this.store.reduxStore.subscribe(() => {
    //   const newState = this.store.reduxStore.getState()
    //   for (let key in newState) {
    //     const value = newState[key]
    //     if (value !== lastState[key]) atom.setProp(key, D.atoms.atomifyDeep(value))
    //   }

    //   for (let key in lastState) {
    //     if (!newState.hasOwnProperty(key)) {
    //       atom.deleteProp(key)
    //     }
    //   }
    //   lastState = newState
    // })

    this.store.reduxStore.subscribe(() => {
      const newState = this.store.reduxStore.getState()
      const diffs: Array<Object> = jsonPatchLib.compare(lastState, newState)
      for (let diff of diffs) {
        if (diff.path.length === 0) {
          throw new Error(`@todo Can't handle zero-length diff paths yet`)
        }

        switch (diff.op) {
          case 'replace': {
            const components = diff.path.split('/')
            components.shift()
            const lastComponent = components.pop()
            let curAtom: $FixMe = atom
            // debugger
            for (let component of components) {
              component = jsonPatchLib.unescapePathComponent(component)
              curAtom =
                curAtom.isDictAtom === 'True'
                  ? curAtom.prop(component)
                  : console.error(`not implemented`)
            }
            // debugger
            if (curAtom.isDictAtom === 'True') {
              curAtom.setProp(
                jsonPatchLib.unescapePathComponent(lastComponent),
                D.atoms.atomifyDeep(diff.value),
              )
            } else {
              throw new Error(`@todo implement me`)
            }
            break
          }
          default:
            console.error(`@todo Diff op '${diff.op}' not yet supported`)
            break
        }
      }
      lastState = newState
      // for (let key in newState) {
      //   const value = newState[key]
      //   if (value !== lastState[key]) atom.setProp(key, D.atoms.atomifyDeep(value))
      // }

      // for (let key in lastState) {
      //   if (!newState.hasOwnProperty(key)) {
      //     atom.deleteProp(key)
      //   }
      // }
      // lastState = newState
    })

    return atom
  }
}
