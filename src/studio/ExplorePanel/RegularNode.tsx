import React from 'react'
import css from './RegularNode.css'
// import {Path} from '$studio/ExplorePanel/types'
import SvgIcon from '$shared/components/SvgIcon'
import {resolveCss} from '$studio/handy'
// import stringStartsWith from 'lodash/startsWith'
// import DerivationAsReactElement from '$src/studio/componentModel/react/utils/DerivationAsReactElement'
import arrowIcon from 'svg-inline-loader!./arrow.svg'
// import {isTheaterComponent} from '$studio/componentModel/react/TheaterComponent/TheaterComponent'
import {
  VolatileId,
  GenericNode as MGenericNode,
} from '$studio/integrations/react/treeMirroring/MirrorOfReactTree'
import PropsAsPointer from '$studio/handy/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import TheaterComponent, {
  isTheaterComponent,
} from '../componentModel/react/TheaterComponent/TheaterComponent'
import AbstractDerivation from '$shared//DataVerse/derivations/AbstractDerivation'
import Studio from '$studio/bootstrap/Studio'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import {getComponentDescriptor} from '$studio/componentModel/selectors'
import Node from './Node'
import {reduceAhistoricState} from '$studio/bootstrap/actions'
import {omit} from 'lodash'

type Props = {
  depth: number
  volatileId: VolatileId
}

const classes = resolveCss(css)

const RegularNode = (props: Props): React.ReactNode => (
  <PropsAsPointer props={props}>
    {(propsP: Pointer<Props>, studio) => {
      const volatileId = val(propsP.volatileId)

      const nodeP = studio._mirrorOfReactTree.atom.pointer.nodesByVolatileId[
        volatileId
      ] as Pointer<MGenericNode>

      const isSelected =
        val(
          studio.atom2.pointer.ahistoricComponentModel
            .selectedElementVolatileId,
        ) === volatileId

      const isExpanded =
        val(
          studio.atom2.pointer.ahistoricComponentModel
            .collapsedElementsByVolatileId[volatileId],
        ) !== true

      // @todo
      const ancestorOfSelectedNode = false
      // @todo
      const toggleExpansion = () => {
        if (isExpanded) {
          studio.store.reduxStore.dispatch(
            reduceAhistoricState(
              [
                'ahistoricComponentModel',
                'collapsedElementsByVolatileId',
                volatileId,
              ] as $FixMe,
              () => true,
            ),
          )
        } else {
          studio.store.reduxStore.dispatch(
            reduceAhistoricState(
              ['ahistoricComponentModel', 'collapsedElementsByVolatileId'],
              s => omit(s, volatileId),
            ),
          )
        }
      }

      const select = () => {
        markElementAsSelected(studio, volatileId)
      }

      const nativeNode = val(nodeP.nativeNode)
      // @todo
      const displayName: string = getDisplayName(nativeNode, studio).getValue()

      let childrenNode: React.ReactNode = null
      const depth = val(propsP.depth)
      const shouldSwallowChild =
        (nativeNode.constructor as $FixMe).shouldSwallowChild === true

      const volatileIdsOfChildrenP = !shouldSwallowChild
        ? nodeP.volatileIdsOfChildren
        : (studio._mirrorOfReactTree.atom.pointer.nodesByVolatileId[
            val(nodeP.volatileIdsOfChildren)[0]
          ] as Pointer<MGenericNode>).volatileIdsOfChildren

      const volatileIdsOfChildren = val(volatileIdsOfChildrenP)
      const numberOfChildren = volatileIdsOfChildren.length
      const hasChildren = numberOfChildren > 0

      if (isExpanded && hasChildren) {
        const childDepth = depth + 1
        childrenNode = (
          <div {...classes('subNodes')}>
            {val(volatileIdsOfChildrenP).map(childVolatileId => {
              return (
                <Node
                  key={`child-${childVolatileId}`}
                  volatileId={childVolatileId}
                  depth={childDepth}
                />
              )
            })}
          </div>
        )
      }

      return (
        <div
          {...classes(
            'container',
            isSelected && 'selected',
            isExpanded && 'expanded',
            hasChildren && 'hasChildren',
            ancestorOfSelectedNode && 'ancestorOfSelectedNode',
          )}
          style={{'--depth': depth}}
        >
          <div className={css.top}>
            <div className={css.bullet} onClick={toggleExpansion}>
              <div className={css.bulletIcon}>
                {<SvgIcon sizing="fill" src={arrowIcon} />}
              </div>
            </div>
            <div key="name" className={css.name} onClick={select}>
              <span className={css.tagOpen}>&lt;</span>
              <span className={css.tagName}>{displayName}</span>
              <span className={css.tagClose}>&gt;</span>
            </div>
            <div key="highlighter" className={css.highlighter} />
          </div>
          {childrenNode}
        </div>
      )
    }}
  </PropsAsPointer>
)

export default RegularNode

const getDisplayName = (
  node:
    | Element
    | React.Component<mixed, mixed>
    | TheaterComponent<$IntentionalAny>,
  studio: Studio,
): AbstractDerivation<string> =>
  autoDerive(() => {
    if (isTheaterComponent(node)) {
      const cls = node.constructor as $FixMe
      if (cls.componentType !== 'Declarative') {
        return cls.displayName
      } else {
        return val(
          // @ts-ignore @todo
          getComponentDescriptor(studio.atom2.pointer, cls.componentId)
            .displayName,
        )
      }
    } else if (node instanceof Element) {
      return node.tagName
    } else {
      const cls = node.constructor as $FixMe
      return cls.displayName || cls.name
    }
  })
function markElementAsSelected(studio: Studio, volatileId: string) {
  studio.store.reduxStore.dispatch(
    reduceAhistoricState(
      ['ahistoricComponentModel', 'selectedElementVolatileId'],
      () => volatileId,
    ),
  )
}
