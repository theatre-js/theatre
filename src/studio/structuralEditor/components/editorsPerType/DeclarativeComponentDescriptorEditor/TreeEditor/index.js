// @flow
import {
  React,
  compose,
  connect,
  reduceStateAction,
  multiReduceStateAction,
} from '$studio/handy'
import css from './index.css'
import PanelSection from '$studio/structuralEditor/components/reusables/PanelSection'
import * as _ from 'lodash'
import generateUniqueId from 'uuid/v4'
import RenderTreeNode from './RenderTreeNode'
import cx from 'classnames'

type Props = {
  pathToComponentDescriptor: Array<string>,
  componentDescriptor: Object,
  dispatch: Function,
}

type State = {
  isCommandPressed: boolean,
  isInFront: boolean,
}

class TreeEditor extends React.PureComponent<Props, State> {
  state: State
  props: Props
  refMap: Object

  constructor(props: Props) {
    super(props)

    this.refMap = {}
    this.state = {
      isCommandPressed: false,
      isInFront: false,
    }
  }

  componentDidMount() {
    document.addEventListener('keyup', this.keyUpHandler)
    document.addEventListener('keydown', this.keyDownHandler)
    document.addEventListener('visibilitychange', this.visibilityChangeHandler)
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.keyUpHandler)
    document.removeEventListener('keydown', this.keyDownHandler)
    document.removeEventListener('visibilitychange', this.visibilityChangeHandler)
  }

  keyUpHandler = e => {
    if (e.key === 'Meta' || e.key === 'Control') {
      this.setState(() => ({isCommandPressed: false}))
    }
  }

  keyDownHandler = e => {
    if (e.key === 'Meta' || e.key === 'Control') {
      this.setState(() => ({isCommandPressed: true}))
    }
  }

  visibilityChangeHandler = () => {
    this.setState(() => ({isCommandPressed: false}))
  }

  addToRefMap = (id: string, obj: Object) => {
    // if (this.container && this.refMap[id] == null) {
    //   const currentHeight = parseInt(this.container.style.minHeight) || 0
    //   this.container.style.minHeight = `${currentHeight + 30}px`
    // }
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

  addChildToNode = (id, index) => {
    const {dispatch, pathToComponentDescriptor} = this.props
    const childId = generateUniqueId()
    // let tag = type
    let tag = 'div'
    let children = []
    // if (type === 'div with text') {
    //   tag = 'div'
    //   children = ''
    // }
    dispatch(
      multiReduceStateAction([
        {
          path: pathToComponentDescriptor.concat('localHiddenValuesById'),
          reducer: values => {
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
        },
        {
          path: pathToComponentDescriptor.concat('localHiddenValuesById', id),
          reducer: node => {
            const child = {
              __descriptorType: 'ReferenceToLocalHiddenValue',
              which: childId,
            }
            const {children} = node.props
            node.props.children = [
              ...children.slice(0, index),
              child,
              ...children.slice(index),
            ]
            return node
          },
        },
      ]),
    )
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

  bringToFront = () => {
    this.setState(() => ({isInFront: true}))
  }

  sendToBack = () => {
    this.setState(() => ({isInFront: false}))
  }

  render() {
    const {componentDescriptor, pathToComponentDescriptor} = this.props
    const {isCommandPressed, isInFront} = this.state
    return (
      <div className={css.container}>
        <PanelSection withHorizontalMargin={false} label="Render Tree">
          <div className={css.treeWrapper}>
            <div ref={c => this.container = c} className={cx(css.treeContainer, {[css.inFront]: isInFront})}>
              <RenderTreeNode
                descriptor={componentDescriptor.whatToRender}
                moveNode={this.moveNode}
                deleteNode={this.deleteNode}
                addChildToNode={this.addChildToNode}
                updateTextChildContent={this.updateTextChildContent}
                rootPath={pathToComponentDescriptor}
                parentPath={pathToComponentDescriptor}
                addToRefMap={this.addToRefMap}
                getLocalHiddenValue={this.getLocalHiddenValue}
                isCommandPressed={isCommandPressed}
                bringParentToFront={this.bringToFront}
                sendParentToBack={this.sendToBack}
              />
            </div>
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
