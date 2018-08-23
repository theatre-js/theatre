import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './TimelineItem.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import {PrimitivePropItem} from '../../utils'
import projectSelectors from '$tl/Project/store/selectors'
import {IBezierCurvesOfScalarValues} from '$tl/Project/store/types'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import ItemWrapper from '$tl/ui/panels/AllInOnePanel/Right/items/ItemWrapper'

const classes = resolveCss(css)
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

    if (!valueContainer || valueContainer.type !== 'BezierCurvesOfScalarValues')
      return null

    const points = valueContainer.points

    return <ItemWrapper item={item}>PointsPropProvider, PointsView</ItemWrapper>
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
