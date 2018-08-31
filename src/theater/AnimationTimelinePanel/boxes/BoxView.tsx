import {BoxObject} from '$theater/AnimationTimelinePanel/types'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import {get} from '$shared/utils'
import React from 'react'
import BoxWrapper from '$theater/AnimationTimelinePanel/boxes/BoxWrapper'
import BoxLegends from '$theater/AnimationTimelinePanel/boxes/BoxLegends'
import VariablesContainer from '$theater/AnimationTimelinePanel/variables/VariablesContainer'
import VariablesPropProvider from '$theater/AnimationTimelinePanel/variables/VariablesPropProvider'
import PureComponentWithTheater from '$theater/handy/PureComponentWithTheater'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'

interface IProps {
  boxIndex: number
  boxId: BoxObject['id']
  pathToTimeline: string[]
}

interface IState {}

class BoxView extends PureComponentWithTheater<IProps, IState> {
  render() {
    return (
      <PropsAsPointer props={this.props}>
        {({props}) => {
          const pathToTimeline = val(props.pathToTimeline)
          const boxId = val(props.boxId)

          const boxIndex = val(props.boxIndex)

          const box: BoxObject = val(get(
            this.theater.atom2.pointer,
            pathToTimeline.concat('boxes', boxId),
          ) as Pointer<BoxObject>)

          if (box == null) return null

          const {height, variables, activeVariable, dopeSheet} = box
          return (
            <BoxWrapper
              height={height}
              index={boxIndex}
              pathToTimeline={pathToTimeline}
              boxId={boxId}
              dopeSheet={dopeSheet}
              numberOfVariables={variables.length}
            >
              <BoxLegends
                boxId={boxId}
                boxIndex={boxIndex}
                variables={variables}
                pathToTimeline={pathToTimeline}
                activeVariable={activeVariable}
              />
              <VariablesPropProvider boxIndex={boxIndex} boxHeight={height}>
                <VariablesContainer
                  variables={variables}
                  pathToTimeline={pathToTimeline}
                  activeVariable={activeVariable}
                  dopeSheet={dopeSheet}
                />
              </VariablesPropProvider>
            </BoxWrapper>
          )
        }}
      </PropsAsPointer>
    )
  }
}

export default BoxView
