import React from 'react'
import {val} from '$shared/DataVerse2/atom'
import Viewports from './Viewports/Viewports'
import elementify from '$studio/componentModel/react/elementify/elementify'
import constant from '$shared/DataVerse/derivations/constant'
import dictAtom from '$shared/DataVerse/atoms/dictAtom'
import PureComponentWithTheater from '$studio/handy/PureComponentWithTheater'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'

interface IProps {
  passThroughNode: React.ReactNode
}

interface IState {}

/**
 * Shows either the viewports, or an expanded viewport, or Passthrough
 */
export default class WhatToShowInBody extends PureComponentWithTheater<
  IProps,
  IState
> {
  render() {
    return (
      <PropsAsPointer props={this.props}>
        {({props}) => {
          const whatToShowInBody = val(
            this.theaterAtom2P.historicWorkspace.viewports.whatToShowInBody,
          )
          if (whatToShowInBody.type === 'Viewports') {
            return <Viewports />
          } else if (whatToShowInBody.type === 'Viewport') {
            return 'single vp'
          } else if (whatToShowInBody.type === 'Passthrough') {
            return val(props.passThroughNode)
          } else if (
            whatToShowInBody.type === 'TestingOnly:DirectlyRenderComponent'
          ) {
            const keyD = constant(
              whatToShowInBody.type + whatToShowInBody.componentId,
            )
            const instantiationDescriptorP = dictAtom({
              componentId: whatToShowInBody.componentId,
            })
              .derivedDict()
              .pointer()
            return elementify(
              keyD,
              instantiationDescriptorP,
              constant(this.theater),
            )
          } else {
            throw new Error(`Bug here`)
          }
        }}
      </PropsAsPointer>
    )
  }
}
