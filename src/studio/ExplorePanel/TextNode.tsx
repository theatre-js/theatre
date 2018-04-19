import React from 'react'
import css from './TextNode.css'
// import {Path} from '$studio/ExplorePanel/types'
// import SvgIcon from '$shared/components/SvgIcon'
// import stringStartsWith from 'lodash/startsWith'
// import DerivationAsReactElement from '$src/studio/componentModel/react/utils/DerivationAsReactElement'
// import {isTheaterComponent} from '$studio/componentModel/react/TheaterComponent/TheaterComponent'
import {
  VolatileId,
  TextNode as MTextNode,
} from '$studio/integrations/react/treeMirroring/MirrorOfReactTree'
import PropsAsPointer from '$studio/handy/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import resolveCss from '$shared/utils/resolveCss'

type Props = {
  depth: number
  volatileId: VolatileId
}

const classes = resolveCss(css)

const TextNode = (props: Props): React.ReactNode => (
  <PropsAsPointer props={props}>
    {(propsP: Pointer<Props>, studio) => {
      const volatileId = val(propsP.volatileId)

      const nodeP = studio.elementTree.mirrorOfReactTree.atom.pointer
        .nodesByVolatileId[volatileId] as Pointer<MTextNode>

      const depth = val(propsP.depth)

      return (
        <div {...classes('container')} style={{'--depth': depth}}>
          <div className={css.top}>
            <div key="name" className={css.name}>
              <div className={css.textLogo}>t</div>
              <div className={css.textContent}>{val(nodeP.text)}</div>
            </div>
            <div key="highlighter" className={css.highlighter} />
          </div>
        </div>
      )
    }}
  </PropsAsPointer>
)

export default TextNode
