import React from 'react'
import {
  VolatileId,
  GenericNode,
} from '$studio/integrations/react/treeMirroring/MirrorOfReactTree'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {val} from '$shared/DataVerse/atom'
import {Pointer} from '$shared/DataVerse/pointer'
import {getVolatileIdsOfChildrenNLevelsDeep} from './NodeTemplate'
import AnyNode from './AnyNode'
import {TheatreConsumer} from '$studio/componentModel/react/utils/studioContext'

type Props = {
  depth: number
  volatileId: VolatileId
}

const ViewportNode = (props: Props): React.ReactElement<$IntentionalAny> => (
  <TheatreConsumer>
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
  </TheatreConsumer>
)

export default ViewportNode
