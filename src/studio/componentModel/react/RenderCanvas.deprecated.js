
import * as React from 'react'
import compose from 'ramda/src/compose'
import {type ComponentID} from '$studio/componentModel/types'
import {withStudio, type WithStudioProps} from '$studio/utils'
import {withSubscribables, type Subscribable, type DeprecatedAtom, default as DataVerse} from '$shared/DataVerse'
import Elementify from './Elementify'

type Props = WithStudioProps & {
  children: DeprecatedAtom<React.Node> ,
  $componentIDToBeRenderedAsCurrentCanvas: Subscribable<?ComponentID>,
}

const RenderCanvas = ({children, $componentIDToBeRenderedAsCurrentCanvas}: Props) => {
  return <Elementify instantiationDescriptor={DataVerse.fromJS()} />

  // return componentInstantiationDescriptorToReactNode({
  //   componentID: componentIDToBeRenderedAsCurrentCanvas,
  //   props: {children: props.children},
  // })
}

export default compose(
  withSubscribables((props: Props) => {
    return {
      $componentIDToBeRenderedAsCurrentCanvas:
        props.studio.atom.getDeepWithPlaceholder(['workspace', 'componentIDToBeRenderedAsCurrentCanvas'])
          .changesToSelf().map((a) => a.getValue() || 'TheaterJS/Core/PassThroughCanvas'),
    }
  }),
  withStudio,
)(RenderCanvas)