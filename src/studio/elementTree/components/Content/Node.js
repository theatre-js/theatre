// @flow
import React from 'react'
import css from './Node.css'
import type {Path} from '$studio/elementTree/types'
import * as _ from 'lodash'
import cx from 'classnames'
import arrowIcon from './arrow.svg'
import SvgIcon from '$shared/components/SvgIcon'

import {connect} from '$studio/handy'
import {getComponentDescriptor} from '$studio/componentModel/selectors'
import stringStartsWith from 'lodash/startsWith'

const dummyClasses = [
  'container',
  'form',
  'separator',
  'input',
  'underline',
  'star',
  'suffix',
  'superscript',
  'indentation',
]

// console.log('blah')

type Props = {
  isExpanded: boolean,
  children: Object,
  path: Path,
  toggleExpansion: Function,
  selectNode: Function,
  selectedNodePath: Path,
  displayName: string,
  shouldSwallowChild: ?boolean,
  depth?: number,
  classNames: string,
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

const fakeClassesWeakMap = new WeakMap()

class Node extends React.PureComponent<Props, void> {
  render() {
    const {props} = this

    const {
      // data: {name},
      displayName,
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

    const hasChildren = children != null
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

          <div
            className={css.name}
            onClick={() => {
              selectNode(path)
            }}
          >
            <span className={css.tagOpen}>&lt;</span>
            <span className={css.tagName}>{displayName}</span>
            <span className={css.dot}>.</span>
            <span className={css.className}>{props.classNames}</span>
            <span className={css.tagClose}>&gt;</span>
          </div>
          <div className={css.highlighter} />
        </div>
        {shouldShowChildren && (
          <div className={css.subNodes}>
            {Object.keys(children).map((key, index) => (
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
          </div>
        )}
      </div>
    )
  }
}

const WrappedNode = connect((s, op) => {
  const {_ref} = op
  const {type} = _ref

  const displayName =
    typeof type === 'string'
      ? type
      : type === null
        ? 'null'
        : _ref.stateNode.getComponentId
          ? (getComponentDescriptor(s, _ref.stateNode.getComponentId()): $FixMe)
              .displayName
          : type.displayName

  const shouldSwallowChild =
    (type &&
      type.componentId &&
      stringStartsWith(type.componentId, 'TheaterJS/Core/HTML/')) ||
    false

  let classNames
  if (!fakeClassesWeakMap.has(_ref)) {
    fakeClassesWeakMap.set(
      _ref,
      dummyClasses[_.random(0, dummyClasses.length - 1)],
    )
  }
  classNames = fakeClassesWeakMap.get(_ref)

  return {
    displayName,
    shouldSwallowChild,
    classNames,
  }
})(Node)

export default WrappedNode
