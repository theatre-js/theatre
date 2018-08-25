import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import {PrimitivePropItem} from '../../utils'
import ItemWrapper from '$tl/ui/panels/AllInOnePanel/Right/items/ItemWrapper'
import ItemPropProvider from '$tl/ui/panels/AllInOnePanel/Right/items/ItemPropProvider'
import ItemView from '$tl/ui/panels/AllInOnePanel/Right/items/ItemView'
import projectSelectors from '$tl/Project/store/selectors'

interface IProps {
  item: PrimitivePropItem
}

interface IState {}

export default class TimelineItem extends UIComponent<IProps, IState> {
  _render(propsP: Pointer<IProps>) {
    const item = val(propsP.item)
    const propState = projectSelectors.historic.getPropState(
      this.project.atomP.historic,
      item.address,
    )

    const valueContainer = val(propState.valueContainer)

    if (
      !valueContainer ||
      valueContainer.type !== 'BezierCurvesOfScalarValues'
    ) {
      return null
    }

    return (
      <ItemWrapper item={item}>
        <ItemPropProvider itemAddress={item.address} itemHeight={item.height}>
          <ItemView expanded={item.expanded} points={valueContainer.points} address={item.address}/>
        </ItemPropProvider>
      </ItemWrapper>
    )
  }

  // setPoints = (points: IBezierCurvesOfScalarValues['points']) => {
  //   this.project.reduxStore.dispatch(
  //     this.project._actions.historic.setPointsInBezierCurvesOfScalarValues({
  //       ...this.props.item.address,
  //       points,
  //     }),
  //   )
  // }
}
