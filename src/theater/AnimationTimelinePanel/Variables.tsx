import React from 'react'
import Variable from './Variable'
import * as _ from 'lodash'
import {colors, svgPaddingY} from './BoxView'

interface IProps {
  variables: $FixMe
  activeVariableId: string
  variableIdToColorIndexMap: {[variableId: string]: number}
  getSvgSize: Function
  getDuration: Function
  addPoint: Function
  showPointValuesEditor: Function
  showContextMenuForPoint: Function
  showContextMenuForConnector: Function
  changePointPositionBy: Function
  changePointHandlesBy: Function
  removePoint: Function
  addConnector: Function
  removeConnector: Function
  makeHandleHorizontal: Function
  addPointToSelection: Function
  removePointFromSelection: Function
}
interface IState {}

type Extremums = [number, number]

class Variables extends React.PureComponent<IProps, IState> {
  variablesExtremums: Record<string, Extremums> = {}

  cleanUpExtremums(variablesIds: string[]) {
    const ids = Object.keys(this.variablesExtremums)
    if(ids == null || (ids && ids.length === 0)) return
    let idsToRemove: string[] = []
    ids.forEach((id: string) => {
      if (variablesIds.indexOf(id) === -1) {
        idsToRemove = idsToRemove.concat(id)
      }
    })
    _.omit(this.variablesExtremums, idsToRemove)
  }

  addExtremums = (variableId: string, extremums: Extremums) => {
    this.variablesExtremums[variableId] = extremums
  }

  mouseDownHandler = (e: React.MouseEvent<SVGRectElement>) => {
    console.log(this)
    this.props.addPoint(
      this.props.activeVariableId,
      this.variablesExtremums[this.props.activeVariableId],
      e,
    )
  }

  render() {
    const {variables, activeVariableId, variableIdToColorIndexMap} = this.props
    this.cleanUpExtremums(variables.map((v: $FixMe) => v.id))
    return (
      <>
        <rect
          key="hit-zone"
          fill="transparent"
          width="100%"
          y={-svgPaddingY / 2}
          style={{height: `calc(100% + ${svgPaddingY}*1px)`}}
          onMouseDown={this.mouseDownHandler}
        />
        {_.sortBy(
          variables,
          (variable: $FixMe) => variable.id === activeVariableId,
        ).map(({id, points}) => (
          <Variable
            key={id}
            variableId={id}
            points={points}
            color={colors[variableIdToColorIndexMap[id]]}
            getSvgSize={this.props.getSvgSize}
            getDuration={this.props.getDuration}
            addPoint={this.props.addPoint}
            addExtremums={this.addExtremums}
            showPointValuesEditor={this.props.showPointValuesEditor}
            showContextMenuForPoint={this.props.showContextMenuForPoint}
            showContextMenuForConnector={this.props.showContextMenuForConnector}
            changePointPositionBy={this.props.changePointPositionBy}
            changePointHandlesBy={this.props.changePointHandlesBy}
            removePoint={this.props.removePoint}
            addConnector={this.props.addConnector}
            removeConnector={this.props.removeConnector}
            makeHandleHorizontal={this.props.makeHandleHorizontal}
            addPointToSelection={this.props.addPointToSelection}
            removePointFromSelection={this.props.removePointFromSelection}
          />
        ))}
      </>
    )
  }
}

export default Variables
