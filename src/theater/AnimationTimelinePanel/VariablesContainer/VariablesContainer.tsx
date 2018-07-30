import {BoxObject, VariableID} from '$theater/AnimationTimelinePanel/types'
import React from 'react'
import css from './VariablesContainer.css'
import resolveCss from '$shared/utils/resolveCss'
import VariableView from '$theater/AnimationTimelinePanel/VariablesContainer/VariableView'
import VariablesSvgWrapper from '$theater/AnimationTimelinePanel/VariablesContainer/VariablesSvgWrapper'
import {sortBy} from 'lodash'
import {colors} from '$theater/AnimationTimelinePanel/utils'

const classes = resolveCss(css)

interface IProps {
  variables: BoxObject['variables']
  activeVariable: BoxObject['activeVariable']
  pathToTimeline: string[]
}

interface IState {}

class VariablesContainer extends React.PureComponent<IProps, IState> {
  getColor = (variableId: VariableID) => {
    return colors[this.props.variables.findIndex(id => id === variableId)]
  }

  render() {
    const {variables, pathToTimeline, activeVariable} = this.props

    return (
      <div {...classes('container')}>
        <VariablesSvgWrapper>
          {sortBy(variables, variableId => variableId === activeVariable).map(
            (variableId: VariableID) => (
              <VariableView
                key={variableId}
                variableId={variableId}
                pathToTimeline={pathToTimeline}
                isActive={activeVariable === variableId}
                color={this.getColor(variableId)}
              />
            ),
          )}
        </VariablesSvgWrapper>
      </div>
    )
  }
}

export default VariablesContainer
