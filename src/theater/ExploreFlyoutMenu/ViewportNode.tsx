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

type Props = {
  depth: number
  volatileId: VolatileId
}

const ViewportNode = (props: Props): React.ReactElement<$IntentionalAny> => (
  <PropsAsPointer props={props}>
    {(propsP: Pointer<Props>, theater) => {
      const nodeP = theater.studio.elementTree.mirrorOfReactTreeAtom.pointer
        .nodesByVolatileId[val(propsP.volatileId)] as Pointer<GenericNode>

      return (
        <NodeTemplate
          volatileId={props.volatileId}
          depth={props.depth}
          key={props.volatileId}
          isSelectable={true}
          name={<div className={css.name}>Name of viewport</div>}
          volatileIdsOfChildren={getVolatileIdsOfChildrenNLevelsDeep(
            nodeP,
            theater,
            3,
          )}
        />
      )
    }}
  </PropsAsPointer>
)

export default ViewportNode
