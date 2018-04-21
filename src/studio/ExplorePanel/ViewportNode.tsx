import React from 'react'
import {VolatileId} from '$studio/integrations/react/treeMirroring/MirrorOfReactTree'
import PropsAsPointer from '$studio/handy/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import Node from './Node'

type Props = {
  depth: number
  volatileId: VolatileId
}

const ViewportNode = (props: Props): React.ReactElement<$IntentionalAny> => (
  <PropsAsPointer props={props}>
    {(propsP: Pointer<Props>) => {
      return (
        <Node volatileId={val(propsP.volatileId)} depth={val(propsP.depth)} />
      )
    }}
  </PropsAsPointer>
)

export default ViewportNode
