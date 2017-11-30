// @flow
import {React, connect, reduceStateAction} from '$studio/handy'
import {
  getComponentDescriptor,
  getPathToComponentDescriptor,
} from '$studio/componentModel/selectors'
import css from './RenderTree.css'
import RenderTreeNode from './RenderTreeNode'

type OwnProps = {
  rootComponentId: string,
}

type Props = OwnProps & {
  rootDescriptor: Object,
  rootPath: string[],
  dispatch: Function,
}

class RenderTree extends React.PureComponent<Props, void> {
  refMap: Object

  constructor(props: Props) {
    super(props)

    this.refMap = {}
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
      dispatch(reduceStateAction(
        rootPath.concat('localHiddenValuesById', parent),
        parentNode => {
          let children = parentNode.props.children
          const nodeToMove = children[index]
          const nodeToReplace = children[index - 1]
          children[index - 1] = nodeToMove
          children[index] = nodeToReplace
          parentNode.props.children = children
          return parentNode
        }
      ))
      return
    }
    if (dir === 'down') {
      const parentChildrenCount = this.refMap[parent].noOfChildren
      if (parentChildrenCount === 1) return
      if (index === parentChildrenCount - 1) return
      dispatch(reduceStateAction(
        rootPath.concat('localHiddenValuesById', parent),
        parentNode => {
          let children = parentNode.props.children
          const nodeToMove = children[index]
          const nodeToReplace = children[index + 1]
          children[index + 1] = nodeToMove
          children[index] = nodeToReplace
          parentNode.props.children = children
          return parentNode
        }
      ))
      return
    }
    if (dir === 'left') {
      const {parent: gParent, index: gIndex} = this.refMap[parent]
      if (gParent == null) return
      let nodeToMove
      dispatch(reduceStateAction(
        rootPath.concat('localHiddenValuesById', parent),
        parentNode => {
          let children = parentNode.props.children
          nodeToMove = children.splice(index, 1)
          parentNode.props.children = children
          return parentNode
        }
      ))
      dispatch(reduceStateAction(
        rootPath.concat('localHiddenValuesById', gParent),
        gParent => {
          let children = gParent.props.children
          const head = children.slice(0, gIndex)
          const tail = children.slice(gIndex)
          gParent.props.children = [...head, ...nodeToMove, ...tail]
          return gParent
        }
      ))
      return
    }
    if (dir === 'right') {
      const parentChildrenCount = this.refMap[parent].noOfChildren
      if (parentChildrenCount === 1) return
      if (index === parentChildrenCount - 1) return
      let nodeToMove
      let moveToPath
      dispatch(reduceStateAction(
        rootPath.concat('localHiddenValuesById', parent),
        parentNode => {
          let children = parentNode.props.children
          const nextNodeId = children[index + 1].which
          const nextNode = this.getLocalHiddenValue(nextNodeId)
          if (Array.isArray(nextNode.props.children)) {
            nodeToMove = children.splice(index, 1)
            moveToPath = rootPath.concat('localHiddenValuesById', nextNodeId)
          }
          parentNode.props.children = children
          return parentNode
        }
      ))
      if (nodeToMove != null) {
        dispatch(reduceStateAction(
          moveToPath,
          node => {
            let children = node.props.children
            children = [...nodeToMove, ...children]
            node.props.children = children
            return node
          }
        ))
      }
      return
    }
  }

  getLocalHiddenValue = (id: $FixMe): Object => {
    return this.props.rootDescriptor.localHiddenValuesById[id]
  }

  render() {
    const {rootDescriptor, rootPath} = this.props
    return (
      <div className={css.container}>
        <RenderTreeNode
          descriptor={rootDescriptor.whatToRender}
          moveNode={this.moveNode}
          rootPath={rootPath}
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
