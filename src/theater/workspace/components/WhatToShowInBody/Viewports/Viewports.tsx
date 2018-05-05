import React from 'react'
import ReactiveComponentWithTheater from '$theater/componentModel/react/utils/ReactiveComponentWithStudio'
import {val} from '$shared/DataVerse2/atom'
import * as css from './Viewports.css'
import resolveCss from '$shared/utils/resolveCss'
import {map, debounce} from 'lodash'
import Viewport from './Viewport'
import {
  reduceHistoricState,
  reduceAhistoricState,
} from '$studio/bootstrap/actions'
import {ViewportsContainer} from '$studio/workspace/types'

const classes = resolveCss(css)

interface IProps {}

interface IState extends ViewportsContainer {
  isOptionDown: boolean
}

export default class Viewports extends ReactiveComponentWithTheater<
  IProps,
  IState
> {
  container: HTMLDivElement | null

  _getInitialState(): IState {
    const {scrollX, scrollY} = val(
      this.studioAtom2P.ahistoricWorkspace.viewportsContainer,
    )
    return {
      scrollX,
      scrollY,
      isOptionDown: false,
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('keyup', this.handleKeyUp)
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.keyCode === 18) {
      this.setState(() => ({isOptionDown: true}))
    }
  }

  handleKeyUp = (e: KeyboardEvent) => {
    if (e.keyCode === 18) {
      this.setState(() => ({isOptionDown: false}))
    }
  }

  _setNoViewportAsActive = () => {
    console.log('hi')

    this.dispatch(
      reduceHistoricState(
        ['historicWorkspace', 'viewports', 'activeViewportId'],
        () => undefined,
      ),
    )
  }

  _scrollHandler = (e: React.WheelEvent<HTMLDivElement>) => {
    const {deltaX, deltaY} = e
    this.setState(({scrollX, scrollY}) => {
      scrollX -= deltaX
      scrollY -= deltaY
      this._saveScrollState(scrollX, scrollY)
      return {
        scrollX,
        scrollY,
      }
    })
  }

  _saveScrollState = debounce(
    (scrollX: number, scrollY: number) => {
      this.dispatch(
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

  _render() {
    // @todo use keys()
    const {scrollX, scrollY, isOptionDown} = val(this.stateP)

    const viewports = val(this.studioAtom2P.historicWorkspace.viewports.byId)
    const viewportEls = map(viewports, s => {
      return <Viewport key={s.id} id={s.id} isOptionDown={isOptionDown}/>
    })

    return (
      <div
        {...classes('container')}
        ref={c => (this.container = c)}
        onWheel={this._scrollHandler}
      >
        <div
          {...classes('viewports')}
          style={{
            left: scrollX,
            top: scrollY,
          }}
        >
          {viewportEls}
        </div>
        <div {...classes('background')} onClick={this._setNoViewportAsActive} />
      </div>
    )
  }
}
