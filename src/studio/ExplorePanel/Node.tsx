import React from 'react'
// import {Path} from '$studio/ExplorePanel/types'
// import stringStartsWith from 'lodash/startsWith'
// import DerivationAsReactElement from '$src/studio/componentModel/react/utils/DerivationAsReactElement'
// import {isTheaterComponent} from '$studio/componentModel/react/TheaterComponent/TheaterComponent'
import {VolatileId} from '$studio/integrations/react/treeMirroring/MirrorOfReactTree'
import PropsAsPointer from '$studio/handy/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import TextNode from './TextNode'
import RegularNode from './RegularNode'

type Props = {
  depth: number
  volatileId: VolatileId
  // isExpanded: boolean
  // children: Object
  // path: Path
  // toggleExpansion: (volatileId: VolatileId) => void
  // selectNode: (volatileId: VolatileId) => void
  // selectedNodePath: Path
  // displayName: string
  // shouldSwallowChild: undefined | null | boolean
  // stateNode: $FixMe
  // elementId: undefined | number
}

const Node = (props: Props): React.ReactNode => (
  <PropsAsPointer props={props}>
    {(propsP: Pointer<Props>, studio) => {
      const volatileId = val(propsP.volatileId)

      const nodeP =
        studio.elementTree.mirrorOfReactTree.atom.pointer.nodesByVolatileId[volatileId]

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

/**
 * This is used for the following situation:
 *
 * <div> <--- this is a TheaterJS element
 *   <div> <--- this is a normal DOM element
 *
 * In the above situation, we want to avoid showing
 * the second <div>, as it's just confusing for the user.
 *
 * This function is used to do that.
 */
// const extractChildrenOfChild = children => {
//   if (children && typeof children === 'object') {
//     const childrenKeys = Object.keys(children)
//     if (childrenKeys.length > 1) {
//       // debugger
//       console.warn(`This should never happen`)
//     }

//     if (childrenKeys.length === 0) {
//       return children
//     } else {
//       const firstChildKey = childrenKeys[0]
//       const firstChild = children[firstChildKey]
//       if (firstChild && typeof firstChild === 'object') {
//         return firstChild.children
//       } else {
//         console.warn('Should this ever happen?')
//         return firstChild
//       }
//     }
//   } else {
//     return children
//   }
// }

class Nodea extends React.PureComponent<IProps, {}> {
  static defaultProps = {depth: 1}
  _toRender: AbstractDerivation<React.ReactNode>
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
  }

  render(): React.ReactNode {
    const {props} = this

    const {
      // data: {name},
      displayName,
      textContent,
      textChild,
      isExpanded,
      selectedNodePath,
      path,
      toggleExpansion,
      selectNode,
      shouldSwallowChild,
    } = props

    const children =
      shouldSwallowChild === true
        ? extractChildrenOfChild(props.children)
        : props.children

    const depth = props.depth || 1

    const hasChildren = children != null || textChild != null
    const shouldShowChildren = isExpanded && hasChildren
    const id = path[path.length - 1]
    const ancestorOfSelectedNode =
      selectedNodePath &&
      selectedNodePath.indexOf(id) !== -1 &&
      selectedNodePath[selectedNodePath.length - 1] !== id

    return null

    return (
      <div
        className={cx(css.container, {
          [css.selected]: selectedNodePath === path,
          [css.expanded]: isExpanded,
          [css.hasChildren]: hasChildren,
          [css.ancestorOfSelectedNode]: ancestorOfSelectedNode,
        })}
        style={{'--depth': depth}}
      >
        <div className={css.top}>
          <div className={css.bullet} onClick={() => toggleExpansion(path)}>
            <div className={css.bulletIcon}>
              {<SvgIcon sizing="fill" src={arrowIcon} />}
            </div>
          </div>

          {displayName !== 'null' && [
            <div
              key="name"
              className={css.name}
              onClick={() => {
                selectNode(path, props.elementId)
              }}
            >
              <span className={css.tagOpen}>&lt;</span>
              <span className={css.tagName}>{displayName}</span>
              <ClassName stateNode={props.stateNode} />
              <span className={css.tagClose}>&gt;</span>
            </div>,
            <div key="highlighter" className={css.highlighter} />,
          ]}
          {textContent != null && [
            <div
              className={css.name}
              key="textName"
              onClick={() => {
                selectNode(path)
              }}
            >
              <div className={css.textLogo}>t</div>
              <div className={css.textContent}>{textContent}</div>
            </div>,
            <div key="highlighter" className={css.highlighter} />,
          ]}
        </div>
        {shouldShowChildren && (
          <div className={css.subNodes}>
            {children != null &&
              Object.keys(children).map((key, index) => (
                <Nodea
                  depth={depth + 1}
                  index={index}
                  key={key}
                  toggleExpansion={toggleExpansion}
                  selectNode={selectNode}
                  selectedNodePath={selectedNodePath}
                  {...children[key]}
                />
              ))}
            {textChild != null && (
              <div className={css.top}>
                <div
                  className={css.name}
                  onClick={() => {
                    selectNode(path)
                  }}
                >
                  <div className={css.textLogo}>t</div>
                  <div className={css.textContent}>{textChild}</div>
                </div>
                <div className={css.highlighter} />
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
}

const ClassName = (nativeNode: React.ReactNode) => {
  if (isTheaterComponent(nativeNode)) {
    const childrenD = nativeNode._atom
      .pointer()
      .prop('props')
      // @ts-ignore @ignore
      .prop('class')
      .map((possibleClass: string | undefined) => {
        if (
          typeof possibleClass === 'string' &&
          possibleClass.trim().length > 0
        ) {
          return (
            <span>
              <span className={css.dot} key="dot">
                .
              </span>
              <span key="className" className={css.className}>
                {possibleClass}
              </span>
            </span>
          )
        } else {
          return null
        }
      })

    return <DerivationAsReactElement derivation={childrenD} />
  } else {
    return null
  }
}

// const WrappedNode = connect((s, op) => {
//   const {_ref} = op

//   const {type, stateNode} = _ref

//   const componentDescriptor =
//     typeof type !== 'string' && type !== null
//       ? (getComponentDescriptor(s, _ref.stateNode.getComponentId()) as $FixMe)
//       : undefined

//   const elementId = _ref && _ref.stateNode && _ref.stateNode.elementId

//   const displayName = componentDescriptor
//     ? componentDescriptor.displayName
//     : type === 'string' ? type : type === null ? 'null' : 'null'

//   const textContent =
//     stateNode.nodeName === '#text' ? stateNode.textContent : null

//   const childRef = _ref.child
//   const textChild =
//     childRef != null &&
//     childRef.child == null &&
//     childRef.stateNode.firstChild &&
//     childRef.stateNode.firstChild.nodeName === '#text' &&
//     childRef.stateNode.lastChild &&
//     childRef.stateNode.lastChild.nodeName === '#text'
//       ? childRef.stateNode.textContent
//       : null

//   const shouldSwallowChild =
//     (type &&
//       type.componentId &&
//       stringStartsWith(type.componentId, 'TheaterJS/Core/HTML/')) ||
//     false

//   return {
//     displayName,
//     shouldSwallowChild,
//     textContent,
//     textChild,
//     stateNode,
//     elementId,
//   }
// })(Node)

// export default Node
