import UnitBezier from 'timing-function/lib/UnitBezier'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import withDeps from '$shared/DataVerse/derivations/withDeps'
import {ITimelinePointInterpolationDescriptor} from '$studio/componentModel/types'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import constant from '$shared/DataVerse/derivations/constant'

type Config = {
  timeD: AbstractDerivation<number>
  interpolationDescriptor: ITimelinePointInterpolationDescriptor
  leftPointTime: number
  leftPointValue: number
  rightPointTime: number
  rightPointValue: number
}

export default function interpolationDerivationForCubicBezier(
  config: Config,
): AbstractDerivation<number> {
  return isConnected(config)
    ? interpolatedValue(config)
    : constant(config.leftPointValue)
}

const unitBezier = (
  interpolationDescriptor: ITimelinePointInterpolationDescriptor,
) => {
  const lx = interpolationDescriptor.handles[0]
  const ly = interpolationDescriptor.handles[1]
  const rx = interpolationDescriptor.handles[2]
  const ry = interpolationDescriptor.handles[3]
  return new UnitBezier(lx, ly, 1 - rx, 1 - ry)
}

const progression = ({timeD, leftPointTime, rightPointTime}: Config) => {
  const distance = rightPointTime - leftPointTime
  return withDeps({timeD}, ({timeD}) => {
    if (typeof rightPointTime === 'number') {
      return (timeD.getValue() - leftPointTime) / distance
    } else {
      return 0
    }
  })
}

const isConnected = ({interpolationDescriptor}: Config) =>
  interpolationDescriptor.connected

const interpolatedValue = (config: Config) => {
  const progressionD = progression(config)
  const solver = unitBezier(config.interpolationDescriptor)
  const {leftPointValue, rightPointValue} = config

  return autoDerive(() => {
    const valueProgression = solver.solveSimple(progressionD.getValue())
    const valueDiff = rightPointValue - leftPointValue

    return leftPointValue + valueProgression * valueDiff
  })
}
