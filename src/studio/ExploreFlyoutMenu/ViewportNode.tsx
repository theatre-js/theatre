import React from 'react'
import {
  VolatileId,
  GenericNode,
} from '$studio/integrations/react/treeMirroring/MirrorOfReactTree'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import {getVolatileIdsOfChildrenNLevelsDeep} from './NodeTemplate'
import AnyNode from './AnyNode'
import {TheaterConsumer} from '$studio/componentModel/react/utils/studioContext'

type Props = {
  depth: number
  volatileId: VolatileId
}

const ViewportNode = (props: Props): React.ReactElement<$IntentionalAny> => (
  <TheaterConsumer>
    {studio => (
      <PropsAsPointer props={props}>
        {({props: propsP}) => {
          const nodeP = studio.studio.elementTree.mirrorOfReactTreeAtom.pointer
            .nodesByVolatileId[val(propsP.volatileId)] as Pointer<GenericNode>

          return (
            <AnyNode
              depth={props.depth}
              volatileId={
                getVolatileIdsOfChildrenNLevelsDeep(nodeP, studio, 3)[0]
              }
            />
          )
        }}
      </PropsAsPointer>
    )}
  </TheaterConsumer>
)

export default ViewportNode
