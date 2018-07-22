import React from 'react'
import {
  VolatileId,
  GenericNode,
} from '$theater/integrations/react/treeMirroring/MirrorOfReactTree'
import PropsAsPointer from '$theater/handy/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import {getVolatileIdsOfChildrenNLevelsDeep} from './NodeTemplate'
import AnyNode from './AnyNode'
import {TheaterConsumer} from '$theater/componentModel/react/utils/theaterContext'

type Props = {
  depth: number
  volatileId: VolatileId
}

const ViewportNode = (props: Props): React.ReactElement<$IntentionalAny> => (
  <TheaterConsumer>
    {theater => (
      <PropsAsPointer props={props}>
        {(propsP: Pointer<Props>) => {
          const nodeP = theater.studio.elementTree.mirrorOfReactTreeAtom.pointer
            .nodesByVolatileId[val(propsP.volatileId)] as Pointer<GenericNode>

          return (
            <AnyNode
              depth={props.depth}
              volatileId={
                getVolatileIdsOfChildrenNLevelsDeep(nodeP, theater, 3)[0]
              }
            />
          )
        }}
      </PropsAsPointer>
    )}
  </TheaterConsumer>
)

export default ViewportNode
