import type {IRange} from '@theatre/shared/utils/types'
import {memoize} from 'lodash-es'

const getFactorsOfNumber = memoize((divisionsPerUnit: number): number[] => {
  const factors = []
  for (let i = 1; i <= divisionsPerUnit; i++) {
    if (divisionsPerUnit % i === 0) {
      factors.push(i)
    }
  }
  return factors
})

/**
 * Calls cb() for every grid line that must be drawn.
 *
 * @remarks
 * For the sake of simplicity, I've named the variables as if the sequence's
 * length is counted in seconds, and the sub-unit is called fps
 * (frames per second). But the algorithm should work for any fps rate, and also
 * non-time-based sequences.
 */
export default function createGrid(
  {
    clippedSpaceRange,
    clippedSpaceWidth,
    fps,
    gapWidth = 120,
  }: {
    /**
     * the width of the canvas, in pixels
     */
    clippedSpaceWidth: number
    clippedSpaceRange: IRange
    fps: number
    /**
     * the minimum amount of space between two grid lines
     */
    gapWidth?: number
  },
  cb: (posInUnitSpace: number, isFullUnit: boolean) => void,
): void {
  // If fps is 60, then frameLengthInSeconeds would be 1/60 => 0.033
  const frameLengthInSeconeds = 1 / fps

  // how much of the timeline is visible.
  const clippedSpaceLengthInSeconds =
    clippedSpaceRange.end - clippedSpaceRange.start // eg: if start: 1 AND end: 3 THEN length = 2

  // how many pixels of space does one frame take
  const frameWidthInScreenSpace =
    clippedSpaceWidth / (fps * clippedSpaceLengthInSeconds)

  // Number of frames that fit in the smallest cell possible.
  // a cell is basically the space between two grid lines
  const numberOfFramesFittingInMinimumCellWidth = Math.floor(
    gapWidth / frameWidthInScreenSpace,
  )

  // Number of frames in each cell, so that lines would be drawn at full seconds
  const numberOfFramesPerCell =
    // if we can't fit a full 60 frames in a cell (or a multiple of 60 frames),
    numberOfFramesFittingInMinimumCellWidth < fps
      ? (getFactorsOfNumber(fps).find(
          // then try fitting 30 frames, or 20, or 15, and other factors of 60
          (factor) => factor >= numberOfFramesFittingInMinimumCellWidth,
        ) as number)
      : // otherwise, determine how many full seconds we can fit in a cell
        fps * Math.floor(numberOfFramesFittingInMinimumCellWidth / fps)

  const cellLengthInSeconds = numberOfFramesPerCell * frameLengthInSeconeds

  // the number of the first cell we'll draw
  const startCell = Math.floor(clippedSpaceRange.start / cellLengthInSeconds)

  // and the last one
  const endCell = Math.ceil(clippedSpaceRange.end / cellLengthInSeconds)

  for (let cell = startCell; cell <= endCell; cell++) {
    const posInUnitSpace = cell * cellLengthInSeconds

    const isFullSecond = posInUnitSpace % 1 === 0

    cb(posInUnitSpace, isFullSecond)
  }
}
