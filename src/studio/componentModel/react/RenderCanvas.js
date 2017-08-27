// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'
import {type ComponentID} from '$studio/componentModel/types'
import componentInstantiationDescriptorToReactNode from './componentInstantiationDescriptorToReactNode'
import ReactiveComponent from './ReactiveComponent'
import {withStudio, withSubscriptions, type WithStudioProps} from '$studio/utils'

type Props = WithStudioProps & {
  children: React.Node,
  componentIDToBeRenderedAsCurrentCanvas: ?ComponentID,
}

const RenderCanvas = (props: Props) => {
  const componentIDToBeRenderedAsCurrentCanvas =
    props.componentIDToBeRenderedAsCurrentCanvas || 'PassThroughCanvas'

  return componentInstantiationDescriptorToReactNode({
    componentID: componentIDToBeRenderedAsCurrentCanvas,
    props: {children: props.children},
  })
}

export default compose(
  withSubscriptions(({studio}: Props): any => {
    return {}
  }),
  withStudio,
  // connect((appState) => {
  //   return {
  //     componentIDToBeRenderedAsCurrentCanvas: appState.workspace.componentIDToBeRenderedAsCurrentCanvas,
  //   }
  // }),
)(RenderCanvas)