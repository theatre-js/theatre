import React from 'react'
import ItemPointsNormalizer from '$tl/ui/panels/AllInOnePanel/Right/items/ItemPointsNormalizer'
import GraphEditorWrapper from '$tl/ui/panels/AllInOnePanel/Right/views/GraphEditorWrapper'
import GraphEditor from '$tl/ui/panels/AllInOnePanel/Right/views/GraphEditor'
import DopesheetWrapper from '$tl/ui/panels/AllInOnePanel/Right/views/DopesheetWrapper'
import {TPoints, TExpanded} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {color} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import Dopesheet from '$tl/ui/panels/AllInOnePanel/Right/views/Dopesheet'

interface IProps {
  expanded: TExpanded
  points: TPoints
}

interface IState {}

class ItemView extends React.PureComponent<IProps, IState> {
  render() {
    return this.props.expanded
      ? this._renderGraphView()
      : this._renderDopesheet()
  }

  _renderGraphView = () => {
    return (
      <GraphEditorWrapper>
        <ItemPointsNormalizer points={this.props.points}>
          {(normalizedPoints, extremums) => (
            <GraphEditor
              points={normalizedPoints}
              extremums={extremums}
              color={color}
            />
          )}
        </ItemPointsNormalizer>
      </GraphEditorWrapper>
    )
  }

  _renderDopesheet = () => {
    return (
      <DopesheetWrapper>
        <ItemPointsNormalizer points={this.props.points}>
          {(normalizedPoints, extremums) => (
            <Dopesheet
              points={normalizedPoints}
              extremums={extremums}
              color={color}
            />
          )}
        </ItemPointsNormalizer>
      </DopesheetWrapper>
    )
  }
}

export default ItemView
