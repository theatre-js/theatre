import React from 'react'
import ReactiveComponentWithStudio from '$studio/componentModel/react/utils/ReactiveComponentWithStudio'
import {val} from '$shared/DataVerse2/atom'
import Viewports from './Viewports/Viewports'

interface IProps {
  passThroughNode: React.ReactNode
}

interface IState {}

/**
 * Shows either the viewports, or an expanded viewport
 */
export default class WhatToShowInBody extends ReactiveComponentWithStudio<
  IProps,
  IState
> {
  _render() {
    const whatToShowInBody = val(
      this.studioAtom2P.workspace.viewports.whatToShowInBody,
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
