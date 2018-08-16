import React from 'react'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import css from './FramesGrid.css'
import resolveCss from '$shared/utils/resolveCss'

const classes = resolveCss(css)

interface IProps {
  canvasWidth: number
  containerWidth: number
  focus: [number, number]
}

interface IState {}

const MIN_CELL_WIDTH = 20
const FPS = 30

class FramesGrid extends React.PureComponent<IProps, IState> {
  canvas: HTMLCanvasElement | null
  frameDuration: number = Number((1000 / FPS).toFixed(5))
  fpsNumberFactors: number[] = getFactors(FPS)
  stampsEl: React.RefObject<HTMLDivElement> = React.createRef()

  render() {
    return (
      <PropsAsPointer props={this.props}>
        {({props}) => {
          const containerWidth = val(props.containerWidth)
          const canvasWidth = val(props.canvasWidth)
          return (
            <div {...classes('container')} style={{width: containerWidth}}>
              <canvas
                {...classes('canvas')}
                ref={c => (this.canvas = c)}
                width={canvasWidth}
                height={100}
                style={{width: canvasWidth}}
              />
              <div
                ref={this.stampsEl}
                style={{width: canvasWidth}}
                {...classes('stamps')}
              />
            </div>
          )
        }}
      </PropsAsPointer>
    )
  }

  componentDidMount() {
    this._drawGrid()
  }

  componentDidUpdate() {
    this._drawGrid()
  }

  _drawGrid() {
    const {canvasWidth, focus} = this.props
    const focusDuration = focus[1] - focus[0]

    const frameWidth = canvasWidth / ((FPS * focusDuration) / 1000)
    // Number of frames that fit in the smallest cell possible
    const framesPerMinCell = Math.ceil(MIN_CELL_WIDTH / frameWidth)
    // Number of frames in each cell, so that lines would be drawn at full seconds
    let framesPerCell: number
    if (framesPerMinCell < FPS) {
      framesPerCell = this.fpsNumberFactors.find(
        n => framesPerMinCell <= n,
      ) as number
    } else {
      // Number of frames that fits in a min-width cell is bigger than the FPS number
      framesPerCell = FPS * Math.ceil(framesPerMinCell / FPS)
    }

    const cellDuration = framesPerCell * this.frameDuration
    // TODO: Explain what you did here!
    const normalizationFactor = 1000 * (framesPerCell / FPS)
    // Time and frame of the first line that'll be drawn
    const startTime =
      Math.ceil(Math.floor(focus[0] / normalizationFactor)) *
      normalizationFactor
    const startFrame = Math.floor((startTime / this.frameDuration) % FPS)
    // Number of lines that we'll draw
    const numberOfLines = Math.floor((focus[1] - startTime) / cellDuration) + 1


    this._renderLines(
      numberOfLines,
      startTime,
      cellDuration,
      framesPerCell,
      startFrame,
    )
  }

  _renderLines(
    numberOfLines: number,
    startTime: number,
    cellDuration: number,
    framesPerCell: number,
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
      } else {
        innerHTML += getFrameStamp(frame, x)
      }

      frame = (frame + framesPerCell) % FPS
    }
    this.stampsEl.current!.innerHTML = innerHTML
  }
}

function getFullSecondStamp(time: number, x: number) {
  return `<span style="
    position: absolute;
    left: ${x}px;
    color: #888;
    font-size: 10px;
    transform: translateX(-50%)">
      ${time}s
    </span>`
}

function getFrameStamp(frame: number, x: number) {
  return `<span style="
    position: absolute;
    left: ${x}px;
    color: #555;
    font-size: 10px;
    transform: translateX(-50%)">
      ${frame}f
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
