// @flow
import {React, connect, reduceStateAction} from '$studio/handy'
import {
  getComponentDescriptor,
  getPathToComponentDescriptor,
} from '$studio/componentModel/selectors'
import css from './RenderTree.css'
import RenderTreeNode from './RenderTreeNode'
import TagsList from './TagsList'
import generateUniqueId from 'uuid/v4'
import cx from 'classnames'

type OwnProps = {
  rootComponentId: string,
}

type Props = OwnProps & {
  rootDescriptor: Object,
  rootPath: string[],
  dispatch: Function,
}

type State = {
  isAddingNewChild: boolean,
  parentOfChildBeingAdded: ?string,
  containerScrollTop: number,
}

class RenderTree extends React.PureComponent<Props, State> {
  refMap: Object

  constructor(props: Props) {
    super(props)

    this.refMap = {}
    this.state = {
      isAddingNewChild: false,
      parentOfChildBeingAdded: null,
    }
  }

  addToRefMap = (id: string, obj: Object) => {
    this.refMap[id] = {...this.refMap[id], ...obj}
  }

  moveNode = (id: string, dir: 'up' | 'down' | 'left' | 'right') => {
    const {dispatch, rootPath} = this.props
    const {parent, index} = this.refMap[id]
    if (dir === 'up') {
      if (index === 0) return
      const parentChildrenCount = this.refMap[parent]
      if (parentChildrenCount === 1) return
      dispatch(
        reduceStateAction(
          rootPath.concat('localHiddenValuesById', parent),
          parentNode => {
            let {children} = parentNode.props
            const nodeToMove = children[index]
            const nodeToReplace = children[index - 1]
            children[index - 1] = nodeToMove
            children[index] = nodeToReplace
            parentNode.props.children = children
            return parentNode
          },
        ),
      )
      return
    }
    if (dir === 'down') {
      const parentChildrenCount = this.refMap[parent].noOfChildren
      if (parentChildrenCount === 1) return
      if (index === parentChildrenCount - 1) return
      dispatch(
        reduceStateAction(
          rootPath.concat('localHiddenValuesById', parent),
          parentNode => {
            let {children} = parentNode.props
            const nodeToMove = children[index]
            const nodeToReplace = children[index + 1]
            children[index + 1] = nodeToMove
            children[index] = nodeToReplace
            parentNode.props.children = children
            return parentNode
          },
        ),
      )
      return
    }
    if (dir === 'left') {
      const {parent: gParent, index: gIndex} = this.refMap[parent]
      if (gParent == null) return
      let nodeToMove
      dispatch(
        reduceStateAction(
          rootPath.concat('localHiddenValuesById', parent),
          parentNode => {
            const {children} = parentNode.props
            nodeToMove = children.splice(index, 1)
            return parentNode
          },
        ),
      )
      dispatch(
        reduceStateAction(
          rootPath.concat('localHiddenValuesById', gParent),
          gParent => {
            const {children} = gParent.props
            const head = children.slice(0, gIndex)
            const tail = children.slice(gIndex)
            gParent.props.children = [...head, ...nodeToMove, ...tail]
            return gParent
          },
        ),
      )
      return
    }
    if (dir === 'right') {
      const parentChildrenCount = this.refMap[parent].noOfChildren
      if (parentChildrenCount === 1) return
      if (index === parentChildrenCount - 1) return
      let nodeToMove
      let moveToPath
      dispatch(
        reduceStateAction(
          rootPath.concat('localHiddenValuesById', parent),
          parentNode => {
            const {children} = parentNode.props
            const nextNodeId = children[index + 1].which
            const nextNode = this.getLocalHiddenValue(nextNodeId)
            if (Array.isArray(nextNode.props.children)) {
              nodeToMove = children.splice(index, 1)
              moveToPath = rootPath.concat('localHiddenValuesById', nextNodeId)
            }
            return parentNode
          },
        ),
      )
      if (nodeToMove != null) {
        dispatch(
          reduceStateAction(moveToPath, node => {
            const {children} = node.props
            node.props.children = [...nodeToMove, ...children]
            return node
          }),
        )
      }
      return
    }
  }

  deleteNode = id => {
    const {rootPath, dispatch} = this.props
    const {parent, index} = this.refMap[id]
    dispatch(
      reduceStateAction(
        rootPath.concat('localHiddenValuesById', parent),
        parentNode => {
          parentNode.props.children.splice(index, 1)
          return parentNode
        },
      ),
    )
  }

  showTagsList = id => {
    this.setState(() => {
      const scrollTopValue = this.container.scrollTop
      this.container.scrollTop = 0
      return {
        isAddingNewChild: true,
        parentOfChildBeingAdded: id,
        containerScrollTop: scrollTopValue,
      }
    })
  }

  hideTagsList() {
    this.setState(state => {
      this.container.scrollTop = state.containerScrollTop
      return {
        isAddingNewChild: false,
        parentOfChildBeingAdded: null,
        containerScrollTop: 0,
      }
    })
  }

  addChildToNode = tag => {
    const {parentOfChildBeingAdded: id} = this.state
    const {dispatch, rootPath} = this.props
    const childId = generateUniqueId()
    dispatch(
      reduceStateAction(rootPath.concat('localHiddenValuesById'), values => {
        const child = {
          __descriptorType: 'ComponentInstantiationValueDescriptor',
          componentId: 'TheaterJS/Core/HTML/' + tag,
          props: {
            key: childId,
            children: [],
          },
          modifierInstantiationDescriptors: {
            byId: {},
            list: [],
          },
        }
        return {...values, [childId]: child}
      }),
    )
    dispatch(
      reduceStateAction(rootPath.concat('localHiddenValuesById', id), node => {
        const child = {
          __descriptorType: 'ReferenceToLocalHiddenValue',
          which: childId,
        }
        const {children} = node.props
        node.props.children = [child, ...children]
        return node
      }),
    )

    this.hideTagsList()
  }

  updateTextChildContent = (id, newContent) => {
    const {dispatch, rootPath} = this.props
    dispatch(
      reduceStateAction(rootPath.concat('localHiddenValuesById', id), node => {
        node.props.children = newContent
        return node
      }),
    )
  }

  getLocalHiddenValue = (id: $FixMe): Object => {
    return this.props.rootDescriptor.localHiddenValuesById[id]
  }

  render() {
    const {rootDescriptor, rootPath} = this.props
    const {isAddingNewChild} = this.state
    return (
      <div
        ref={c => (this.container = c)}
        className={cx(css.container, {[css.noScroll]: isAddingNewChild})}
      >
        {isAddingNewChild && <TagsList onClick={this.addChildToNode} />}
        <RenderTreeNode
          descriptor={rootDescriptor.whatToRender}
          moveNode={this.moveNode}
          deleteNode={this.deleteNode}
          addChildToNode={this.showTagsList}
          updateTextChildContent={this.updateTextChildContent}
          rootPath={rootPath}
          parentPath={rootPath}
          addToRefMap={this.addToRefMap}
          getLocalHiddenValue={this.getLocalHiddenValue}
        />
      </div>
    )
  }
}

export default connect((s, op) => {
  return {
    rootDescriptor: getComponentDescriptor(s, op.rootComponentId),
    rootPath: getPathToComponentDescriptor(op.rootComponentId),
  }
})(RenderTree)
