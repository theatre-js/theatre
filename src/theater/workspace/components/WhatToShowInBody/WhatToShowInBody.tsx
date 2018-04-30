import React from 'react'
import ReactiveComponentWithTheater from '$theater/componentModel/react/utils/ReactiveComponentWithStudio'
import {val} from '$shared/DataVerse2/atom'
import Viewports from './Viewports/Viewports'

interface IProps {
  passThroughNode: React.ReactNode
}

interface IState {}

/**
 * Shows either the viewports, or an expanded viewport
 */
export default class WhatToShowInBody extends ReactiveComponentWithTheater<
  IProps,
  IState
> {
  _render() {
    const whatToShowInBody = val(
      this.theaterAtom2P.historicWorkspace.viewports.whatToShowInBody,
    )
    if (whatToShowInBody.type === 'Viewports') {
      return <Viewports />
    } else if (whatToShowInBody.type === 'Viewport') {
      return 'single vp'
    } else {
      return val(this.propsP.passThroughNode)
    }
  }
}
