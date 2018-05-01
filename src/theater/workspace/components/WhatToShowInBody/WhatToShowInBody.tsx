import React from 'react'
import ReactiveComponentWithTheater from '$theater/componentModel/react/utils/ReactiveComponentWithStudio'
import {val} from '$shared/DataVerse2/atom'
import Viewports from './Viewports/Viewports'
import elementify from '$theater/componentModel/react/elementify/elementify'
import constant from '$shared/DataVerse/derivations/constant'
import dictAtom from '$shared/DataVerse/atoms/dictAtom'
import arrayAtom from '$shared/DataVerse/atoms/arrayAtom'

interface IProps {
  passThroughNode: React.ReactNode
}

interface IState {}

/**
 * Shows either the viewports, or an expanded viewport, or Passthrough
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
    } else if (whatToShowInBody.type === 'Passthrough') {
      return val(this.propsP.passThroughNode)
    } else if (
      whatToShowInBody.type === 'TestingOnly:DirectlyRenderComponent'
    ) {
      const keyD = constant(
        whatToShowInBody.type + whatToShowInBody.componentId,
      )
      const instantiationDescriptorP = dictAtom({
        componentId: whatToShowInBody.componentId,
        props: dictAtom({}),
        modifierInstantiationDescriptors: dictAtom({
          list: arrayAtom([]),
          byId: dictAtom({}),
        }),
      })
        .derivedDict()
        .pointer()
      return elementify(keyD, instantiationDescriptorP, constant(this.theater))
    } else {
      throw new Error(`Bug here`)
    }
  }
}
