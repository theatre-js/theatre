import React from 'react'
import {render} from 'react-dom'
import LBCommunicator from '$studio/commsWithLB/LBCommunicator'
import StudioRootComponent from './components/StudioRootComponent'
import {reduceAhistoricState} from '$studio/bootstrap/actions'
import StatePersistor from '$studio/statePersistence/StatePersistor'
import ElementTree from './ElementTree'
import Theatre from '$studio/bootstrap/Theatre'

export default class TheatreStudio {
  elementTree: ElementTree
  _statePersistor: StatePersistor
  _ran: boolean
  _lbCommunicator: LBCommunicator

  constructor(readonly studio: Theatre) {
    this._ran = false
    this.elementTree = new ElementTree()
    this._lbCommunicator = new LBCommunicator({
      lbUrl: `${window.location.protocol}//${window.location.hostname}:${
        $env.studio.socketPort
      }`,
    })
    this._statePersistor = new StatePersistor(studio)

    this._lbCommunicator.getSocket()
  }

  _run(pathToProject: string) {
    this.studio.store.dispatch(
      reduceAhistoricState(['pathToProject'], () => pathToProject),
    )

    this._mountElement()
  }

  _tick() {
    this.elementTree.tick()
  }

  _mountElement() {
    const rootEl = document.createElement('div')
    rootEl.id = 'studiojs-studio'
    if (document.body) {
      document.body.appendChild(rootEl)
    } else {
      // @todo This error message is confusing. Let's rewrite it so that it
      // would tell the user exactly what they have to do to fix the problem.
      throw new Error(`Where is the <body> tag?`)
    }

    render(<StudioRootComponent studio={this.studio} />, rootEl)
  }
}
