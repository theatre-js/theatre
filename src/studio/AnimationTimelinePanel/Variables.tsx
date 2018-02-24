import {React} from '$studio/handy'
import Variable from './Variable'
import * as _ from 'lodash'

interface IProps {
  shouldReRenderVariables: boolean
  resetReRenderVariablesFlag: Function
  activeVariableId: string
  getVariables: Function
  colors: {[id: string]: string}
  getSvgSize: Function
  showPointValuesEditor: Function
  showContextMenuForPoint: Function
  showContextMenuForConnector: Function
  changePointPositionBy: Function
  changePointHandlesBy: Function
  removePoint: Function
  addConnector: Function
  removeConnector: Function
  makeHandleHorizontal: Function
}
interface IState {}

class Variables extends React.Component<IProps, IState> {
  variablesObject: $FixMe
  constructor(props: IProps) {
    super(props)

    this.variablesObject = this.props.getVariables()
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (nextProps.shouldReRenderVariables) {
      this.variablesObject = this.props.getVariables()
      this.props.resetReRenderVariablesFlag()
    }
  }

  shouldComponentUpdate(nextProps: IProps) {
    return !_.isEqual(nextProps, this.props)
  }

  render() {
    console.log('render')
    const {colors, activeVariableId} = this.props
    return (
      _.sortBy(this.variablesObject, (variable: $FixMe) => (variable.id === activeVariableId)).map(({id, points}) => (
        <Variable
          key={id}
          variableId={id}
          points={points}
          color={colors[id]}
          getSvgSize={this.props.getSvgSize}
          showPointValuesEditor={this.props.showPointValuesEditor}
          showContextMenuForPoint={this.props.showContextMenuForPoint}
          showContextMenuForConnector={this.props.showContextMenuForConnector}
          changePointPositionBy={this.props.changePointPositionBy}
          changePointHandlesBy={this.props.changePointHandlesBy}
          removePoint={this.props.removePoint}
          addConnector={this.props.addConnector}
          removeConnector={this.props.removeConnector}
          makeHandleHorizontal={this.props.makeHandleHorizontal}
        />
      ))
    )
  }
}

export default Variables