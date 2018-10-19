import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import {PrimitivePropItem} from '../../utils'
import ItemWrapper from '$tl/ui/panels/AllInOnePanel/Right/items/ItemWrapper'
import ItemPropProvider from '$tl/ui/panels/AllInOnePanel/Right/items/ItemPropProvider'
import ItemView from '$tl/ui/panels/AllInOnePanel/Right/items/ItemView'
import projectSelectors from '$tl/Project/store/selectors'
import StaticValueContainerItem from '$tl/ui/panels/AllInOnePanel/Right/items/StaticValueContainerItem/StaticValueContainerItem'
import {IBezierCurvesOfScalarValues} from '$tl/Project/store/types'

interface IProps {
  item: PrimitivePropItem
}

interface IState {}

export default class TimelineItem extends UIComponent<IProps, IState> {
  _render(propsP: Pointer<IProps>) {
    const item = val(propsP.item)
    const propStateP = projectSelectors.historic.getPropState(
      this.internalProject.atomP.historic,
      item.address,
    )

    const valueContainerType = val(propStateP.valueContainer.type)

    if (!valueContainerType || valueContainerType === 'StaticValueContainer') {
      return (
        <ItemWrapper sticky={true} item={item} type="static">
          <StaticValueContainerItem item={item} />
        </ItemWrapper>
      )
    } else if (valueContainerType !== 'BezierCurvesOfScalarValues') {
      return null
    }

    const valueContainer = val(
      propStateP.valueContainer,
    ) as IBezierCurvesOfScalarValues

    return (
      <ItemWrapper item={item} sticky={false} type="bezierCurves">
        <ItemPropProvider
          itemKey={item.key}
          itemAddress={item.address}
          itemHeight={item.height}
          itemExpanded={item.expanded}
        >
          <ItemView
            expanded={item.expanded}
            points={valueContainer.points}
            address={item.address}
          />
        </ItemPropProvider>
      </ItemWrapper>
    )
  }
}
