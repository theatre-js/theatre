import React from 'react'
import {
  VolatileId,
  GenericNode,
} from '$studio/integrations/react/treeMirroring/MirrorOfReactTree'
import PropsAsPointer from '$studio/handy/PropsAsPointer'
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
    {(propsP: Pointer<Props>, studio) => {
      const nodeP = studio.elementTree.mirrorOfReactTreeAtom.pointer
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
            studio,
            3,
          )}
        />
      )
    }}
  </PropsAsPointer>
)

export default ViewportNode
