import {React} from '$studio/handy'
import Variable from './Variable'
import * as _ from 'lodash'
import {colors} from './BoxView'

interface IProps {
  variables: $FixMe
  activeVariableId: string
  variableIdToColorIndexMap: {[variableId: string]: number}
  getSvgSize: Function
  getDuration: Function
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
  render() {
    const {variables, activeVariableId, variableIdToColorIndexMap} = this.props
    return (
      _.sortBy(variables, (variable: $FixMe) => (variable.id === activeVariableId)).map(({id, points, extremums}) => (
        <Variable
          key={id}
          variableId={id}
          points={points}
          extremums={extremums}
          color={colors[variableIdToColorIndexMap[id]]}
          getSvgSize={this.props.getSvgSize}
          getDuration={this.props.getDuration}
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