import React from 'react'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import css from './FramesGrid.css'
import resolveCss from '$shared/utils/resolveCss'
import PureComponentWithTheater from '$theater/handy/PureComponentWithTheater'
import {
  xToFocusedTime,
  focusedTimeToX,
} from '$theater/AnimationTimelinePanel/utils'

const classes = resolveCss(css)

interface IProps {
  canvasWidth: number
  focus: [number, number]
}

interface IState {}

const MIN_CELL_WIDTH = 20
const FPS = 30

class FramesGrid extends PureComponentWithTheater<IProps, IState> {
  canvas: HTMLCanvasElement | null
  fullSecondStampsRef: React.RefObject<HTMLDivElement> = React.createRef()
  frameStampRef: React.RefObject<HTMLDivElement> = React.createRef()
  containerRef: React.RefObject<HTMLDivElement> = React.createRef()
  containerRect: {left: number; top: number; right: number; bottom: number}
  frameDuration: number = Number((1000 / FPS).toFixed(6).slice(0, -1)) /* slice: 6.66667 -> 6.66666*/
  fpsNumberFactors: number[] = getFactors(FPS)
  framesPerCell: number
  mouseX: null | number = null

  render() {
    return (
      <>
        <PropsAsPointer props={this.props}>
          {({props}) => {
            const canvasWidth = val(props.canvasWidth)
            return (
              <div
                ref={this.containerRef}
                {...classes('container')}
                style={{width: canvasWidth}}
              >
                <canvas
                  {...classes('canvas')}
                  ref={c => (this.canvas = c)}
                  width={canvasWidth}
                  height={100}
                  style={{width: canvasWidth}}
                />
                <div style={{width: canvasWidth}} {...classes('stamps')}>
                  <div ref={this.fullSecondStampsRef} />
                  <div ref={this.frameStampRef} {...classes('frameStamp')} />
                </div>
              </div>
            )
          }}
        </PropsAsPointer>
        <PropsAsPointer>{this._subscribeToPanelsChanges}</PropsAsPointer>
      </>
    )
  }

  componentDidMount() {
    this._updateContainerRect()
    this._drawGrid()

    document.addEventListener('mousemove', this.handleMouseMove)
  }

  componentDidUpdate() {
    this._drawGrid()
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove)
  }

  _drawGrid() {
    const {canvasWidth, focus} = this.props
    const focusDuration = focus[1] - focus[0]

    const frameWidth = canvasWidth / ((FPS * focusDuration) / 1000)
    // Number of frames that fit in the smallest cell possible
    const framesPerMinCell = Math.ceil(MIN_CELL_WIDTH / frameWidth)
    // Number of frames in each cell, so that lines would be drawn at full seconds
    if (framesPerMinCell < FPS) {
      this.framesPerCell = this.fpsNumberFactors.find(
        n => framesPerMinCell <= n,
      ) as number
    } else {
      // Number of frames that fits in a min-width cell is bigger than the FPS number
      this.framesPerCell = FPS * Math.ceil(framesPerMinCell / FPS)
    }

    const cellDuration = this.framesPerCell * this.frameDuration
    // TODO: Explain what you did here!
    const normalizationFactor = 1000 * (this.framesPerCell / FPS)
    // Time and frame of the first line that'll be drawn
    const startTime =
      Math.ceil(Math.floor(focus[0] / normalizationFactor)) *
      normalizationFactor

    const startFrame = Math.floor((startTime / this.frameDuration) % FPS)
    // Number of lines that we'll draw
    const numberOfLines = Math.floor((focus[1] - startTime) / cellDuration) + 1

    this._renderLines(numberOfLines, startTime, cellDuration, startFrame)
  }

  _renderLines(
    numberOfLines: number,
    startTime: number,
    cellDuration: number,
    startFrame: number,
  ) {
    const {canvasWidth, focus} = this.props
    const timeToX = canvasWidth / (focus[1] - focus[0])
    const offsetLeft = timeToX * (startTime - focus[0])
    const widthStep = timeToX * cellDuration

    let innerHTML = ''
    const ctx = this.canvas!.getContext('2d') as CanvasRenderingContext2D
    ctx.clearRect(0, 0, canvasWidth, 100)

    for (let i = 0, frame = startFrame; i < numberOfLines; i++) {
      const x = offsetLeft + i * widthStep
      const isFullSecond = frame === 0

      ctx.strokeStyle = isFullSecond
        ? 'rgba(225, 225, 225, 0.1)'
        : 'rgba(100, 100, 100, 0.1)'
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 100)
      ctx.stroke()
      ctx.closePath()

      if (isFullSecond) {
        const lineTime = startTime + i * cellDuration
        const fullSecondTime =
          Math.ceil(lineTime) % 1000 === 0
            ? Math.ceil(lineTime / 1000)
            : Math.floor(lineTime / 1000)
        innerHTML += getFullSecondStamp(fullSecondTime, x)
      }

      frame = (frame + this.framesPerCell) % FPS
    }
    if (this.mouseX != null) this._renderFrameStamp()
    this.fullSecondStampsRef.current!.innerHTML = innerHTML
  }

  _renderFrameStamp() {
    const {focus, canvasWidth} = this.props
    const mouseTime = xToFocusedTime(focus, canvasWidth)(this.mouseX!)
    // TODO: add comments!
    const mouseTimeMiliseconds = mouseTime % 1000
    const frame =
      Math.round(
        mouseTimeMiliseconds / this.frameDuration / this.framesPerCell,
      ) * this.framesPerCell

    const stampTime =
      mouseTime - mouseTimeMiliseconds + frame * this.frameDuration
    const stampX = focusedTimeToX(focus, canvasWidth)(stampTime)

    this.frameStampRef.current!.style.transform = `translate3d(calc(${stampX}px - 50%), 0, 0)`
    this.frameStampRef.current!.innerHTML = frame % FPS !== 0 ? `${frame}f` : ''
  }

  _clearFrameStamp() {
    this.frameStampRef.current!.innerHTML = ''
  }

  _updateContainerRect() {
    if (this.containerRef.current == null) return
    const {
      left,
      top,
      right,
      bottom,
    } = this.containerRef.current!.getBoundingClientRect()
    this.containerRect = {left, top, right, bottom}
  }

  _subscribeToPanelsChanges = () => {
    val(this.theater.atom2.pointer.historicWorkspace.panels)
    this._updateContainerRect()
    return null
  }

  handleMouseMove = (e: MouseEvent) => {
    const {left, top, right, bottom} = this.containerRect
    const {clientX, clientY} = e
    if (
      clientX >= left &&
      clientX <= right &&
      clientY >= top &&
      clientY <= bottom
    ) {
      this.mouseX = clientX - left
      this._renderFrameStamp()
    } else {
      this.mouseX = null
      this._clearFrameStamp()
    }
  }
}

function getFullSecondStamp(time: number, x: number) {
  return `<span
  style="left: ${x}px;"
  class="${css.fullSecondStamp}">
      ${time}s
  </span>`
}

function getFactors(num: number): number[] {
  const factors = []
  for (let i = 1; i <= num; i++) {
    if (num % i === 0) {
      factors.push(i)
    }
  }
  return factors
}

export default FramesGrid
