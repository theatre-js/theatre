// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {connect} from 'react-redux'
import {withRunSaga, type WithRunSagaProps} from '$shared/utils'
import {getLanesByIds} from '$studio/animationTimeline/selectors'
import {addPointToLane} from '$studio/animationTimeline/sagas'
import css from './LanesViewer.css'
import Lane from './Lane'

type Props = WithRunSagaProps & {
  boxHeight: number,
  lanes: $FlowFixMe,
  laneIds: $FlowFixMe,
  splitLane: Function,
}

type State = {
  offset: {top: number, left: number},
  isAddingNewPoint: boolean,
}

class LanesViewer extends React.PureComponent {
  props: Props
  state: State
  svgArea: HTMLElement

  // ??
  static colors = ['darkturquoise', 'orchid', 'mediumspringgreen', 'gold']

  constructor(props: Props) {
    super(props)
  }

  addPoint = (e: SyntheticMouseEvent) => {
    const {top, left} = this.svgArea.getBoundingClientRect()
    const t = e.clientX - left
    const value = e.clientY - top
    this.props.runSaga(addPointToLane, this.props.laneIds[0], t, value)
  }

  render() {
    const {lanes, splitLane, boxHeight} = this.props
    const svgHeight = boxHeight - 14
    const shouldSplit = (lanes.length > 1)
    return (
      <div className={css.container}>
        <div className={css.titleBar}>
          {lanes.map(({id, component, property}, index) => (
            <div
              key={id}
              className={css.title}
              {...(shouldSplit ? {onClick: () => splitLane(id)} : {})}>
              <div className={css.componentName}>{component}</div>
              <div className={css.propertyName} style={{color: LanesViewer.colors[index%4]}}>{property}</div>
            </div>
          ))
          }
        </div>
        <div className={css.svgArea}>
          <svg
            height={svgHeight}
            width='100%'
            ref={(svg) => {this.svgArea = svg}}
            onDoubleClick={this.addPoint}>
            {
              lanes.map(({id, points}, index) => (
                <Lane
                  key={id}
                  laneId={id}
                  points={points}
                  color={LanesViewer.colors[index%4]} />
              ))
            }
          </svg>
        </div>
      </div>
    )
  }
}

export default compose(
  connect(
    (state: $FlowFixMe, ownProps: $FlowFixMe) => {
      return {
        lanes: getLanesByIds(state, ownProps.laneIds),
      }
    }
  ),
  withRunSaga(),
)(LanesViewer)