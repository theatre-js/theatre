import React from 'react'
import css from './BoxLegends.css'
import resolveCss from '$shared/utils/resolveCss'
import {
  BoxObject,
  VariableID,
  TimelineObject,
} from '$studio/AnimationTimelinePanel/types'
import Legend from '$studio/AnimationTimelinePanel/boxes/Legend'
import {colors, stopPropagation} from '$studio/AnimationTimelinePanel/utils'
import {reduceHistoricState} from '$studio/bootstrap/actions'
import immer from 'immer'
import generateUniqueId from 'uuid/v4'
import PureComponentWithTheater from '$studio/handy/PureComponentWithTheater'

const classes = resolveCss(css)
const colorsLength = colors.length

interface IProps {
  boxId: BoxObject['id']
  boxIndex: number
  variables: BoxObject['variables']
  activeVariable: BoxObject['activeVariable']
  pathToTimeline: string[]
}

interface IState {}

class BoxLegends extends PureComponentWithTheater<IProps, IState> {
  render() {
    const {variables, activeVariable} = this.props
    const isSplittable = variables.length > 1
    return (
      <div {...classes('stickyWrapper')} onMouseDown={stopPropagation}>
        <div {...classes('container')}>
          {variables.map((variableId: VariableID, index: number) => {
            return (
              <Legend
                key={variableId}
                color={colors[index % colorsLength].normal}
                variableId={variableId}
                pathToTimeline={this.props.pathToTimeline}
                isActive={activeVariable === variableId}
                isSplittable={isSplittable}
                splitVariable={this.splitVariable}
                setActiveVariable={this.setActiveVariable}
              />
            )
          })}
        </div>
      </div>
    )
  }

  setActiveVariable = (variableId: VariableID) => {
    this.dispatch(
      reduceHistoricState(
        this.props.pathToTimeline.concat(
          'boxes',
          this.props.boxId,
          'activeVariable',
        ),
        () => variableId,
      ),
    )
  }

  splitVariable = (variableId: VariableID) => {
    this.dispatch(
      reduceHistoricState(
        this.props.pathToTimeline,
        (timeline: TimelineObject) => {
          return immer(timeline, t => {
            const newBoxId = generateUniqueId()
            const currentBox = t.boxes[this.props.boxId]
            // remove the variable form its current box
            currentBox.variables = currentBox.variables.filter(
              id => id !== variableId,
            )
            // create a new box for the variable
            t.boxes[newBoxId] = {
              id: newBoxId,
              height: currentBox.height,
              variables: [variableId],
              activeVariable: variableId,
              dopeSheet: currentBox.dopeSheet,
            } as BoxObject
            // add the new box to the layout
            t.layout.splice(this.props.boxIndex + 1, 0, newBoxId)

            return t
          })
        },
      ),
    )
  }
}

export default BoxLegends
