import React from 'react'
import {
  VolatileId,
  GenericNode,
} from '$theater/integrations/react/treeMirroring/MirrorOfReactTree'
import PropsAsPointer from '$theater/handy/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import NodeTemplate, {getVolatileIdsOfChildrenNLevelsDeep} from './NodeTemplate'
import * as css  from './ViewportNode.css'
import AnyNode from './AnyNode'

type Props = {
  depth: number
  volatileId: VolatileId
}

const ViewportNode = (props: Props): React.ReactElement<$IntentionalAny> => (
  <PropsAsPointer props={props}>
    {(propsP: Pointer<Props>, theater) => {
      const nodeP = theater.studio.elementTree.mirrorOfReactTreeAtom.pointer
        .nodesByVolatileId[val(propsP.volatileId)] as Pointer<GenericNode>

      return <AnyNode depth={props.depth} volatileId={getVolatileIdsOfChildrenNLevelsDeep(
        nodeP,
        theater,
        3,
      )[0]} />
    }}
  </PropsAsPointer>
)

export default ViewportNode
