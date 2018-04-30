import React from 'react'
import * as css from './TextNode.css'
import {
  VolatileId,
  TextNode as MTextNode,
} from '$theater/integrations/react/treeMirroring/MirrorOfReactTree'
import PropsAsPointer from '$theater/handy/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import NodeTemplate from './NodeTemplate'

type Props = {
  depth: number
  volatileId: VolatileId
}

const TextNode = (props: Props) => (
  <PropsAsPointer props={props}>
    {(propsP: Pointer<Props>, theater) => {
      const volatileId = val(propsP.volatileId)

      const nodeP = theater.studio.elementTree.mirrorOfReactTreeAtom.pointer
        .nodesByVolatileId[volatileId] as Pointer<MTextNode>

      const depth = val(propsP.depth)

      return (
        <NodeTemplate
          depth={depth}
          isSelectable={false}
          volatileId={volatileId}
          volatileIdsOfChildren={null}
          name={
            <>
              <div className={css.textLogo}>t</div>
              <div className={css.textContent}>{val(nodeP.text)}</div>
            </>
          }
        />
      )
    }}
  </PropsAsPointer>
)

export default TextNode
