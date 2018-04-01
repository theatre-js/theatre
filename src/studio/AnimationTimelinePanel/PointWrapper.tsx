import {React} from '$src/studio/handy'
import Point from './Point'

interface Props {}
interface State {}

class PointWrapper extends React.PureComponent<Props, State> {
  render() {
    const {point, prevPoint, nextPoint} = this.props
    return (
      <Point
        color={this.props.color}
        // key={`${point._value}${point._t}`}
        {...(prevPoint
          ? {
              prevPointTime: prevPoint.time,
              prevPointValue: prevPoint.value,
              prevPointHandles:
                prevPoint.interpolationDescriptor.handles,
              prevPointConnected:
                prevPoint.interpolationDescriptor.connected,
            }
          : {})}
        {...(nextPoint
          ? {
              nextPointTime: nextPoint.time,
              nextPointValue: nextPoint.value,
            }
          : {})}
        pointTime={point.time}
        pointValue={point.value}
        pointHandles={point.interpolationDescriptor.handles}
        pointConnected={point.interpolationDescriptor.connected}
        pointAbsoluteTime={point._t}
        pointAbsoluteValue={point._value}
        pointIndex={this.props.pointIndex}
        getSvgSize={this.props.getSvgSize}
        showPointValuesEditor={this.props.showPointValuesEditor}
        showContextMenu={this.props.showContextMenuForPoint}
        changePointPositionBy={this.props.changePointPositionBy}
        changePointHandlesBy={this.props.changePointHandlesBy}
        removePoint={this.props.removePoint}
        addConnector={this.props.addConnector}
        makeHandleHorizontal={this.props.makeHandleHorizontal}
        addPointToSelection={this.props.addPointToSelection}
        removePointFromSelection={this.props.removePointFromSelection}
      />
    )
  }
}

export default PointWrapper
