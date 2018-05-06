import React from 'react'
import {ActiveMode} from '$studio/common/components/ActiveModeDetector/ActiveModeDetector'
import {reduceAhistoricState} from '$studio/bootstrap/actions'
import {debounce} from 'lodash'
import {ViewportsContainer} from '$studio/workspace/types'

interface IProps {
  classes: $FixMe
  initialState: ViewportsContainer
  activeMode: ActiveMode
  children: (scrollX: number, scrollY: number) => any
  dispatch: Function
}

interface IState extends ViewportsContainer {}

export class Container extends React.PureComponent<IProps, IState> {
  container: HTMLDivElement | null

  constructor(props: IProps) {
    super(props)

    this.state = props.initialState
  }

  private handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
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
    if (e.target === this.container) console.log('mouse down')
  }

  render() {
    const {scrollX, scrollY} = this.state
    return (
      <div
        {...this.props.classes}
        ref={c => (this.container = c)}
        onWheel={this.handleWheel}
        onMouseDown={this.handleMouseDown}
      >
        {this.props.children(scrollX, scrollY)}
      </div>
    )
  }
}

export default Container
