// @flow
import {React} from '$studio/handy'
import RenderTree from './RenderTree'
import css from './index.css'

type OwnProps = {
  inputs: {
    selectedNode: Object,
  },
}

type Props = OwnProps & {
  getSelectedNodeDescriptor: Function,
}

type State = {
  activeComponentRenderer: Function,
}

class Content extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      activeComponentRenderer: this._getActiveComponentRenderer(props),
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.inputs.selectedNode !== nextProps.inputs.selectedNode) {
      this.setState(() => ({
        activeComponentRenderer: this._getActiveComponentRenderer(nextProps),
      }))
    }
  }

  shouldComponentUpdate(nextProps: Props) {
    return this.props.inputs.selectedNode !== nextProps.inputs.selectedNode
  }

  _getActiveComponentRenderer(props: Props) {
    // ??
    const {inputs: {selectedNode}} = props
    if (selectedNode == null) {
      return () => <div className={css.noElement}>No element selected.</div>
    }

    const {componentId, componentType} = selectedNode
    if (componentType === 'Declarative') {
      return () => <RenderTree rootComponentId={componentId} />
    } else {
      return () => (
        <div className={css.hardCoded}>Selected element is hard coded!</div>
      )
    }
  }

  render() {
    return (
      <div className={css.container}>
        {this.state.activeComponentRenderer()}
      </div>
    )
  }
}

export default Content
