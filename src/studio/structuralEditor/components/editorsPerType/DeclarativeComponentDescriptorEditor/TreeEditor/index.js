// @flow
import {React, compose, connect, reduceStateAction} from '$studio/handy'
import css from './index.css'
import PanelSection from '$studio/structuralEditor/components/reusables/PanelSection'
import * as _ from 'lodash'
import generateUniqueId from 'uuid/v4'
import cx from 'classnames'
import RenderTreeNode from './RenderTreeNode'
import TagsList from './TagsList'

type Props = {
  pathToComponentDescriptor: Array<string>,
  componentDescriptor: Object,
  dispatch: Function,
}

type State = {
  isAddingNewChild: boolean,
  parentOfChildBeingAdded: ?string,
  containerScrollTop: number,
}

class TreeEditor extends React.PureComponent<Props, State> {
  state: State
  props: Props
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
    const {dispatch, pathToComponentDescriptor} = this.props
    const {parent, index} = this.refMap[id]
    if (dir === 'up') {
      if (index === 0) return
      const parentChildrenCount = this.refMap[parent]
      if (parentChildrenCount === 1) return
      dispatch(
        reduceStateAction(
          pathToComponentDescriptor.concat('localHiddenValuesById', parent),
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
          pathToComponentDescriptor.concat('localHiddenValuesById', parent),
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
          pathToComponentDescriptor.concat('localHiddenValuesById', parent),
          parentNode => {
            const {children} = parentNode.props
            nodeToMove = children.splice(index, 1)
            return parentNode
          },
        ),
      )
      dispatch(
        reduceStateAction(
          pathToComponentDescriptor.concat('localHiddenValuesById', gParent),
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
          pathToComponentDescriptor.concat('localHiddenValuesById', parent),
          parentNode => {
            const {children} = parentNode.props
            const nextNodeId = children[index + 1].which
            const nextNode = this.getLocalHiddenValue(nextNodeId)
            if (Array.isArray(nextNode.props.children)) {
              nodeToMove = children.splice(index, 1)
              moveToPath = pathToComponentDescriptor.concat(
                'localHiddenValuesById',
                nextNodeId,
              )
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
    const {pathToComponentDescriptor, dispatch} = this.props
    const {parent, index} = this.refMap[id]
    dispatch(
      reduceStateAction(
        pathToComponentDescriptor.concat('localHiddenValuesById', parent),
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

  addChildToNode = type => {
    const {parentOfChildBeingAdded: id} = this.state
    const {dispatch, pathToComponentDescriptor} = this.props
    const childId = generateUniqueId()
    let tag = type
    let children = []
    if (type === 'div with text') {
      tag = 'div'
      children = ''
    }
    dispatch(
      reduceStateAction(
        pathToComponentDescriptor.concat('localHiddenValuesById'),
        values => {
          const child = {
            __descriptorType: 'ComponentInstantiationValueDescriptor',
            componentId: 'TheaterJS/Core/HTML/' + tag,
            props: {
              key: childId,
              children,
            },
            modifierInstantiationDescriptors: {
              byId: {},
              list: [],
            },
          }
          return {...values, [childId]: child}
        },
      ),
    )
    dispatch(
      reduceStateAction(
        pathToComponentDescriptor.concat('localHiddenValuesById', id),
        node => {
          const child = {
            __descriptorType: 'ReferenceToLocalHiddenValue',
            which: childId,
          }
          const {children} = node.props
          node.props.children = [child, ...children]
          return node
        },
      ),
    )
    this.hideTagsList()
  }

  updateTextChildContent = (id, newContent) => {
    const {dispatch, pathToComponentDescriptor} = this.props
    dispatch(
      reduceStateAction(
        pathToComponentDescriptor.concat('localHiddenValuesById', id),
        node => {
          node.props.children = newContent
          return node
        },
      ),
    )
  }

  getLocalHiddenValue = (id: $FixMe): Object => {
    return this.props.componentDescriptor.localHiddenValuesById[id]
  }

  render() {
    const {componentDescriptor, pathToComponentDescriptor} = this.props
    const {isAddingNewChild} = this.state
    return (
      <div className={css.container}>
        <PanelSection withHorizontalMargin={false} label="RenderTree">
          <div
            ref={c => (this.container = c)}
            className={cx(css.treeContainer, {[css.noScroll]: isAddingNewChild})}
          >
            {isAddingNewChild && <TagsList onClick={this.addChildToNode} />}
            <RenderTreeNode
              descriptor={componentDescriptor.whatToRender}
              moveNode={this.moveNode}
              deleteNode={this.deleteNode}
              addChildToNode={this.showTagsList}
              updateTextChildContent={this.updateTextChildContent}
              rootPath={pathToComponentDescriptor}
              parentPath={pathToComponentDescriptor}
              addToRefMap={this.addToRefMap}
              getLocalHiddenValue={this.getLocalHiddenValue}
            />
          </div>
        </PanelSection>
      </div>
    )
  }
}

export default compose(
  connect((s, op) => {
    return {
      componentDescriptor: _.get(s, op.pathToComponentDescriptor),
    }
  }),
)(TreeEditor)
