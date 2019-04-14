import React from 'react'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {val} from '$shared/DataVerse/atom'
import css from './FramesGrid.css'
import resolveCss from '$shared/utils/resolveCss'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import {
  inRangeXToPaddedScrollSpaceX,
  timeToInRangeX,
} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import {TRange, TDuration} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {viewportScrolledSpace} from '../Right/utils'
import {padStart} from 'lodash-es'

const classes = resolveCss(css)

interface IProps {
  timelineWidth: number
  range: TRange
  duration: TDuration
}

interface IState {}

const MIN_CELL_WIDTH = 80
const FPS = 30

export default class FramesGrid extends React.PureComponent<IProps, IState> {
  canvas: HTMLCanvasElement | null
  fullSecondStampsRef: React.RefObject<HTMLDivElement> = React.createRef()
  frameStampRef: React.RefObject<HTMLDivElement> = React.createRef()
  frameStampLineRef: React.RefObject<HTMLDivElement> = React.createRef()
  containerRef: React.RefObject<HTMLDivElement> = React.createRef()
  containerRect: {left: number; top: number; right: number; bottom: number}
  frameDuration: number = Number(
    (1000 / FPS).toFixed(6).slice(0, -1),
  ) /* slice: 6.66667 -> 6.66666*/
  fpsNumberFactors: number[] = getFactors(FPS)
  framesPerCell: number
  mouseX: null | number = null

  render() {
    return (
      <>
        <PropsAsPointer props={this.props}>
          {({props: propsP}) => {
            const timelineWidth = val(propsP.timelineWidth)
            return (
              <div
                ref={this.containerRef}
                {...classes('container')}
                style={{width: timelineWidth}}
              >
                <canvas
                  {...classes('canvas')}
                  ref={c => (this.canvas = c)}
                  width={timelineWidth}
                  height={100}
                />
                <div style={{width: timelineWidth}} {...classes('stamps')}>
                  <div ref={this.fullSecondStampsRef} />
                  <div
                    ref={this.frameStampLineRef}
                    {...classes('frameStampLine')}
                  />
                  <div ref={this.frameStampRef} {...classes('frameStamp')} />
                </div>
              </div>
            )
          }}
        </PropsAsPointer>
        <AllInOnePanelStuff>
          {alInOnePanelStuff => (
            <PropsAsPointer>
              {() => {
                val(alInOnePanelStuff.width)
                val(alInOnePanelStuff.heightMinusBottom)
                val(alInOnePanelStuff.rightWidth)
                this._updateContainerRect()
                return null
              }}
            </PropsAsPointer>
          )}
        </AllInOnePanelStuff>
      </>
    )
  }

  componentDidMount() {
    this._updateContainerRect()
    this._drawGrid()

    document.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('resize', this._updateContainerRect)
    this._renderFrameStamp()
  }

  componentDidUpdate() {
    this._drawGrid()
    this._renderFrameStamp()
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('resize', this._updateContainerRect)
  }

  _drawGrid() {
    const {timelineWidth, range} = this.props
    const rangeDuration = range.to - range.from

    const frameWidth = timelineWidth / ((FPS * rangeDuration) / 1000)
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
      Math.ceil(Math.floor(range.from / normalizationFactor)) *
      normalizationFactor

    const startFrame = Math.floor((startTime / this.frameDuration) % FPS)
    // Number of lines that we'll draw
    const numberOfLines = Math.floor((range.to - startTime) / cellDuration) + 1

    this._renderLines(numberOfLines, startTime, cellDuration, startFrame)
  }

  _renderLines(
    numberOfLines: number,
    startTime: number,
    cellDuration: number,
    startFrame: number,
  ) {
    const {timelineWidth, range, duration} = this.props
    const timeInX = timelineWidth / (range.to - range.from)
    const offsetLeft = timeInX * (startTime - range.from)
    const widthStep = timeInX * cellDuration

    let innerHTML = ''
    const ctx = this.canvas!.getContext('2d') as CanvasRenderingContext2D
    ctx.clearRect(0, 0, timelineWidth, 100)

    for (let i = 0, frame = startFrame; i <= numberOfLines; i++) {
      const x = inRangeXToPaddedScrollSpaceX(
        offsetLeft + i * widthStep,
        range,
        duration,
        timelineWidth,
      )
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

    this.fullSecondStampsRef.current!.innerHTML = innerHTML
  }

  _renderFrameStamp() {
    const {range, duration, timelineWidth} = this.props
    const mouseTime = viewportScrolledSpace.xToTime(
      range,
      duration,
      timelineWidth,
    )(this.mouseX!)
    // TODO: add comments!
    const mouseTimeMiliseconds = mouseTime % 1000

    const frame = Math.round(mouseTimeMiliseconds / this.frameDuration)

    const stampTime =
      mouseTime - mouseTimeMiliseconds + frame * this.frameDuration
    const stampX = timeToInRangeX(range, duration, timelineWidth)(stampTime)

    const s = Math.floor(mouseTime / 1000)

    this.frameStampRef.current!.style.transform = `translate3d(calc(${stampX}px - 50%), 0, 0)`
    this.frameStampRef.current!.innerHTML = `${s}:${padStart(
      String(frame),
      2,
      '0',
    )}`
    this.frameStampLineRef.current!.style.transform = `translate3d(calc(${stampX}px - 50%), 0, 0)`
  }

  _clearFrameStamp() {
    this.frameStampRef.current!.innerHTML = ''
  }

  _updateContainerRect = () => {
    if (this.containerRef.current == null) return
    const {
      left,
      top,
      right,
      bottom,
    } = this.containerRef.current.getBoundingClientRect()
    this.containerRect = {left, top, right, bottom}
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
