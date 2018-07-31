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
    // Time of the first line that'll be drawn
    const startTime =
      Math.ceil(Math.floor(focus[0] / normalizationFactor)) *
      normalizationFactor
    // Number of lines that we'll draw
    const numberOfLines = Math.floor((focus[1] - startTime) / cellDuration) + 1

    this._renderLines(numberOfLines, startTime, cellDuration)
  }

  _renderLines(numberOfLines: number, startTime: number, cellDuration: number) {
    const {canvasWidth, focus} = this.props
    const timeToX = canvasWidth / (focus[1] - focus[0])
    const offsetLeft = timeToX * (startTime - focus[0])
    const widthStep = timeToX * cellDuration

    const ctx = this.canvas!.getContext('2d') as CanvasRenderingContext2D
    ctx.clearRect(0, 0, canvasWidth, 100)
    ctx.globalAlpha = 0.1
    for (let i = 0; i < numberOfLines; i++) {
      const lineTime = startTime + i * cellDuration
      ctx.strokeStyle =
        Math.ceil(lineTime) % 1000 === 0 || Math.floor(lineTime) % 1000 === 0
          ? 'rgb(225, 225, 225)'
          : 'rgb(100, 100, 100)'
      ctx.beginPath()
      ctx.moveTo(offsetLeft + i * widthStep, 0)
      ctx.lineTo(offsetLeft + i * widthStep, 100)
      ctx.stroke()
      ctx.closePath()
    }
  }

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
            </div>
          )
        }}
      </PropsAsPointer>
    )
  }
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
