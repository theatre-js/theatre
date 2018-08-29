import React from 'react'
import ItemPointsNormalizer from '$tl/ui/panels/AllInOnePanel/Right/items/ItemPointsNormalizer'
import GraphEditor from '$tl/ui/panels/AllInOnePanel/Right/views/GraphEditor'
import {TPoints, TExpanded} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {color} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import Dopesheet from '$tl/ui/panels/AllInOnePanel/Right/views/Dopesheet'
import ItemHitZone from '$tl/ui/panels/AllInOnePanel/Right/items/ItemHitZone'
import {PrimitivePropItem} from '$tl/ui/panels/AllInOnePanel/utils'
import SVGWrapper from '$tl/ui/panels/AllInOnePanel/Right/views/SVGWrapper';

interface IProps {
  expanded: TExpanded
  points: TPoints
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
              <ItemHitZone
                color={color}
                extremums={extremums}
                duration={duration}
                dopeSheet={false}
                address={this.props.address}
              />
              <GraphEditor
                points={normalizedPoints}
                extremums={extremums}
                color={color}
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
              <ItemHitZone
                color={color}
                extremums={extremums}
                duration={duration}
                dopeSheet={true}
                address={this.props.address}
              />
              <Dopesheet
                points={normalizedPoints}
                extremums={extremums}
                color={color}
              />
            </>
          )}
        </ItemPointsNormalizer>
      </SVGWrapper>
    )
  }
}

export default ItemView
