import React from 'react'
import {VolatileId} from '$studio/integrations/react/treeMirroring/MirrorOfReactTree'
import PropsAsPointer from '$studio/handy/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import TextNode from './TextNode'
import RegularNode from './RegularNode'

type Props = {
  depth: number
  volatileId: VolatileId
}

const Node = (props: Props): React.ReactElement<any> => (
  <PropsAsPointer props={props}>
    {(propsP: Pointer<Props>, studio) => {
      const volatileId = val(propsP.volatileId)

      const nodeP =
        studio.elementTree.mirrorOfReactTreeAtom.pointer.nodesByVolatileId[volatileId]

      const type = val(nodeP.type)

      if (type === 'Text') {
        return (
          <TextNode
            volatileId={val(propsP.volatileId)}
            depth={val(propsP.depth)}
          />
        )
      } else {
        return (
          <RegularNode
            volatileId={val(propsP.volatileId)}
            depth={val(propsP.depth)}
          />
        )
      }
    }}
  </PropsAsPointer>
)

export default Node