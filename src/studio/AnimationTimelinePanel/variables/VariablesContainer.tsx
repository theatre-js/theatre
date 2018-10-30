import {BoxObject, VariableID} from '$studio/AnimationTimelinePanel/types'
import React from 'react'
import css from './VariablesContainer.css'
import resolveCss from '$shared/utils/resolveCss'
import VariableProcessor from '$studio/AnimationTimelinePanel/variables/VariableProcessor'
import GraphsSvgWrapper from '$studio/AnimationTimelinePanel/variables/GraphsSvgWrapper'
import {sortBy} from '$shared/utils'
import {colors} from '$studio/AnimationTimelinePanel/utils'
import VariableHitZone from '$studio/AnimationTimelinePanel/variables/VariableHitZone'
import DopeSheetWrapper from '$studio/AnimationTimelinePanel/variables/DopeSheetWrapper'
import DopeSheet from '$studio/AnimationTimelinePanel/views/DopeSheet'
import GraphEditor from '$studio/AnimationTimelinePanel/views/GraphEditor'

const classes = resolveCss(css)

interface IProps {
  variables: BoxObject['variables']
  activeVariable: BoxObject['activeVariable']
  pathToTimeline: string[]
  dopeSheet: boolean
}

interface IState {}

class VariablesContainer extends React.PureComponent<IProps, IState> {
  render() {
    return (
      <div {...classes('container')} data-hideontoggle={true}>
        {this.props.dopeSheet
          ? this._renderDopeSheet()
          : this._renderGraphView()}
      </div>
    )
  }

  _renderGraphView() {
    const {variables, pathToTimeline, activeVariable} = this.props
    return (
      <GraphsSvgWrapper>
        {sortBy(variables, variableId => variableId === activeVariable).map(
          (variableId: VariableID) => {
            const color = this._getGraphColor(variableId)
            return (
              <VariableProcessor
                key={variableId}
                variableId={variableId}
                pathToTimeline={pathToTimeline}
              >
                {(normalizedPoints, extremums, duration) => (
                  <>
                    {activeVariable === variableId ? (
                      <VariableHitZone
                        color={color}
                        duration={duration}
                        extremums={extremums}
                        variableId={variableId}
                        pathToTimeline={pathToTimeline}
                        dopeSheet={false}
                      />
                    ) : null}
                    <GraphEditor
                      points={normalizedPoints}
                      extremums={extremums}
                      color={color}
                      pathToTimeline={pathToTimeline}
                      variableId={variableId}
                    />
                  </>
                )}
              </VariableProcessor>
            )
          },
        )}
      </GraphsSvgWrapper>
    )
  }

  _renderDopeSheet() {
    const {variables, pathToTimeline} = this.props
    const variablesLength = variables.length
    return variables.map((variableId: VariableID, index: number) => {
      const color = colors[index]
      // gives the vertical position value of the center line of the dope sheet, in percentages, relative to the box's height
      const valueRelativeToBoxHeight = Number(
        (((index + 0.5) / variablesLength) * 100).toFixed(2),
      )
      return (
        <VariableProcessor
          key={variableId}
          variableId={variableId}
          pathToTimeline={pathToTimeline}
        >
          {(normalizedPoints, extremums, duration) => (
            <DopeSheetWrapper>
              <VariableHitZone
                color={color}
                duration={duration}
                extremums={extremums}
                variableId={variableId}
                pathToTimeline={pathToTimeline}
                dopeSheet={true}
              />
              <DopeSheet
                color={color}
                points={normalizedPoints}
                variableId={variableId}
                extremums={extremums}
                valueRelativeToBoxHeight={valueRelativeToBoxHeight}
                pathToTimeline={pathToTimeline}
              />
            </DopeSheetWrapper>
          )}
        </VariableProcessor>
      )
    })
  }

  _getGraphColor = (variableId: VariableID) => {
    return colors[this.props.variables.findIndex(id => id === variableId)]
  }
}

export default VariablesContainer
