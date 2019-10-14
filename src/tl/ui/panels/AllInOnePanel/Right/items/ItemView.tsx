import React from 'react'
import ItemPointsNormalizer from '$tl/ui/panels/AllInOnePanel/Right/items/ItemPointsNormalizer'
import GraphEditor from '$tl/ui/panels/AllInOnePanel/Right/views/GraphEditor'
import {
  IPoints,
  IExpanded,
  IColorAccent,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import Dopesheet from '$tl/ui/panels/AllInOnePanel/Right/views/Dopesheet'
import HitzoneForAddingPoints from '$tl/ui/panels/AllInOnePanel/Right/items/HitzoneForAddingPoints'
import {PrimitivePropItem} from '$tl/ui/panels/AllInOnePanel/utils'
import SVGWrapper from '$tl/ui/panels/AllInOnePanel/Right/views/SVGWrapper'

interface IProps {
  expanded: IExpanded
  points: IPoints
  address: PrimitivePropItem['address']
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
      <SVGWrapper>
        <ItemPointsNormalizer points={this.props.points}>
          {(normalizedPoints, extremums, duration) => (
            <>
              <HitzoneForAddingPoints
                colorAccent={colorAccent}
                extremums={extremums}
                duration={duration}
                dopeSheet={false}
                address={this.props.address}
              />
              <GraphEditor
                points={normalizedPoints}
                extremums={extremums}
                colorAccent={colorAccent}
              />
            </>
          )}
        </ItemPointsNormalizer>
      </SVGWrapper>
    )
  }

  _renderDopesheet = () => {
    return (
      <SVGWrapper dopesheet>
        <ItemPointsNormalizer points={this.props.points}>
          {(normalizedPoints, extremums, duration) => (
            <>
              <HitzoneForAddingPoints
                colorAccent={colorAccent}
                extremums={extremums}
                duration={duration}
                dopeSheet={true}
                address={this.props.address}
              />
              <Dopesheet
                points={normalizedPoints}
                extremums={extremums}
                colorAccent={colorAccent}
              />
            </>
          )}
        </ItemPointsNormalizer>
      </SVGWrapper>
    )
  }
}

export default ItemView

export const colorAccent: IColorAccent = {
  name: 'blue',
  normal: '#3AAFA9',
  darkened: '#345b59',
}
