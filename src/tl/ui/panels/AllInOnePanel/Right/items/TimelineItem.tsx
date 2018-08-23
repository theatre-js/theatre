import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './TimelineItem.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import {PrimitivePropItem} from '../../utils'
import projectSelectors from '$tl/Project/store/selectors'
import {IBezierCurvesOfScalarValues} from '$tl/Project/store/types'

const classes = resolveCss(css)
interface IProps {
  item: PrimitivePropItem
}

interface IState {}

export default class TimelineItem extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

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

    return (
      <div
        {...classes('container')}
        onDoubleClick={this.toggleExpansion}
        style={{top: item.top, height: item.height}}
      >
        {item.address.propKey}
      </div>
    )
  }

  toggleExpansion = () => {
    this.ui.reduxStore.dispatch(
      this.ui.actions.historic.setPropExpansion({
        expanded: !this.props.item.expanded,
        ...this.props.item.address,
      }),
    )
  }

  setExpansionHeight = (height: number) => {
    this.ui.reduxStore.dispatch(
      this.ui.actions.historic.setPropHeightWhenExpanded({
        ...this.props.item.address,
        height,
      }),
    )
  }

  setPoints = (points: IBezierCurvesOfScalarValues['points']) => {
    this.project.reduxStore.dispatch(
      this.project._actions.historic.setPointsInBezierCurvesOfScalarValues({
        ...this.props.item.address,
        points,
      }),
    )
  }
}