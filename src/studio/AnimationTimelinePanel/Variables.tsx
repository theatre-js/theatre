import {React} from '$studio/handy'
import Variable from './Variable'
import * as _ from 'lodash'
import {colors} from './BoxView'

interface IProps {
  shouldReRenderVariables: boolean
  resetReRenderVariablesFlag: Function
  activeVariableId: string
  variableIdToColorIndexMap: {[variableId: string]: number}
  getVariables: Function
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

class Variables extends React.PureComponent<IProps, IState> {
  variablesObject: $FixMe
  constructor(props: IProps) {
    super(props)

    this.variablesObject = this.props.getVariables()
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (nextProps.shouldReRenderVariables) {
      this.props.resetReRenderVariablesFlag()
      this.variablesObject = this.props.getVariables()
    }
  }

  render() {
    const {activeVariableId, variableIdToColorIndexMap} = this.props
    return (
      _.sortBy(this.variablesObject, (variable: $FixMe) => (variable.id === activeVariableId)).map(({id, points}) => (
        <Variable
          key={id}
          variableId={id}
          points={points}
          color={colors[variableIdToColorIndexMap[id]]}
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