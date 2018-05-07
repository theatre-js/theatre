import React from 'react'
import {
  ActiveMode,
  MODES,
} from '$theater/common/components/ActiveModeDetector/ActiveModeDetector'
import {
  reduceAhistoricState,
  reduceHistoricState,
} from '$theater/bootstrap/actions'
import {debounce} from 'lodash'
import {ViewportsContainer, IViewport} from '$theater/workspace/types'
import generateUniqueId from 'uuid/v4'
import ViewportInstantiator, {
  TBoundingRect,
} from '$theater/workspace/components/WhatToShowInBody/Viewports/ViewportInstantiator'

interface IProps {
  classes: $FixMe
  initialState: ViewportsContainer
  activeMode: ActiveMode
  children: (scrollX: number, scrollY: number) => any
  dispatch: Function
}

interface IState extends ViewportsContainer {
  newViewportProps: undefined | null | {id: string; x: number; y: number}
}

export class Container extends React.PureComponent<IProps, IState> {
  container: HTMLDivElement | null

  constructor(props: IProps) {
    super(props)

    this.state = {
      ...props.initialState,
      newViewportProps: null,
    }
  }

  private handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.target !== this.container) return
    const {deltaX, deltaY} = e
    this.setState(({scrollX, scrollY}) => {
      scrollX -= deltaX
      scrollY -= deltaY
      this.saveScrollState(scrollX, scrollY)
      return {
        scrollX,
        scrollY,
      }
    })
  }

  private saveScrollState = debounce(
    (scrollX: number, scrollY: number) => {
      this.props.dispatch(
        reduceAhistoricState(
          ['ahistoricWorkspace', 'viewportsContainer'],
          viewportsContainerState => ({
            ...viewportsContainerState,
            scrollX,
            scrollY,
          }),
        ),
      )
    },
    100,
    {trailing: true},
  )

  private handleMouseDown = (e: MouseEvent) => {
    if (this.props.activeMode !== MODES.cmd || e.target !== this.container)
      return

    const id = generateUniqueId()
    const x = e.clientX
    const y = e.clientY
    this.setState(() => ({
      newViewportProps: {
        id,
        x,
        y,
      },
    }))
  }

  private createEmptyViewport = ({left, top, width, height}: TBoundingRect) => {
    const {newViewportProps, scrollX, scrollY} = this.state
    const {id} = newViewportProps!
    this.setState(() => ({newViewportProps: null}))

    this.props.dispatch(
      reduceHistoricState(['historicWorkspace', 'viewports'], viewports => {
        const newViewPort: IViewport = {
          id,
          dimensions: {width, height},
          position: {x: left - scrollX, y: top - scrollY},
          sceneComponentId: 'EmptyScene',
        }
        return {
          ...viewports,
          byId: {
            ...viewports.byId,
            [id]: newViewPort,
          },
          activeViewportId: id,
        }
      }),
    )
  }

  render() {
    const {scrollX, scrollY, newViewportProps} = this.state
    return (
      <div
        {...this.props.classes}
        ref={c => (this.container = c)}
        onWheel={this.handleWheel}
        onMouseDown={this.handleMouseDown}
      >
        {this.props.children(scrollX, scrollY)}
        {newViewportProps != null && (
          <ViewportInstantiator
            x={newViewportProps.x}
            y={newViewportProps.y}
            createViewport={this.createEmptyViewport}
          />
        )}
      </div>
    )
  }
}

export default Container
