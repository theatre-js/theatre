// @flow
import React from 'react'
import css from './Node.css'
import {Path} from '$studio/elementTree/types'
import * as _ from 'lodash'
import cx from 'classnames'
import arrowIcon from './arrow.svg'
import SvgIcon from '$shared/components/SvgIcon'

import {connect} from '$studio/handy'
import {getComponentDescriptor} from '$studio/componentModel/selectors'
import stringStartsWith from 'lodash/startsWith'
import DerivationAsReactElement from '$src/studio/componentModel/react/utils/DerivationAsReactElement'

interface IProps {
  isExpanded: boolean
  children: Object
  path: Path
  toggleExpansion: Function
  selectNode: Function
  selectedNodePath: Path
  displayName: string
  shouldSwallowChild: undefined | null | boolean
  depth?: number
  stateNode: $FixMe
}

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
const extractChildrenOfChild = children => {
  if (children && typeof children === 'object') {
    const childrenKeys = Object.keys(children)
    if (childrenKeys.length > 1) {
      // debugger
      console.warn(`This should never happen`)
    }

    if (childrenKeys.length === 0) {
      return children
    } else {
      const firstChildKey = childrenKeys[0]
      const firstChild = children[firstChildKey]
      if (firstChild && typeof firstChild === 'object') {
        return firstChild.children
      } else {
        console.warn('Should this ever happen?')
        return firstChild
      }
    }
  } else {
    return children
  }
}

class Node extends React.PureComponent<IProps, void> {
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
                selectNode(path)
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
                <WrappedNode
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

const ClassName = ({stateNode}) => {
  if (stateNode && stateNode.isTheaterJSComponent === true) {
    const childrenD = stateNode._atom.pointer().prop('props').prop('class').map((possibleClass) => {
      if (typeof possibleClass === 'string' && possibleClass.trim().length > 0) {
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

const WrappedNode = connect((s, op) => {
  const {_ref} = op
  const {type, stateNode} = _ref

  const componentDescriptor =
    typeof type !== 'string' && type !== null
      ? (getComponentDescriptor(s, _ref.stateNode.getComponentId()) as $FixMe)
      : undefined

  const displayName = componentDescriptor
    ? componentDescriptor.displayName
    : type === 'string' ? type : type === null ? 'null' : 'null'

  const textContent =
    stateNode.nodeName === '#text' ? stateNode.textContent : null

  const childRef = _ref.child
  const textChild =
    childRef != null &&
    childRef.child == null &&
    childRef.stateNode.firstChild &&
    childRef.stateNode.firstChild.nodeName === '#text' &&
    childRef.stateNode.lastChild &&
    childRef.stateNode.lastChild.nodeName === '#text'
      ? childRef.stateNode.textContent
      : null

  const shouldSwallowChild =
    (type &&
      type.componentId &&
      stringStartsWith(type.componentId, 'TheaterJS/Core/HTML/')) ||
    false

  return {
    displayName,
    shouldSwallowChild,
    textContent,
    textChild,
    stateNode,
  }
})(Node)

export default WrappedNode
