import UnitBezier from 'timing-function/lib/UnitBezier'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import withDeps from '$shared/DataVerse/derivations/withDeps'
import {Pointer} from '$shared/DataVerse2/pointer'
import {ITimelinePointInterpolationDescriptor} from '$theater/componentModel/types'
import {valueDerivation, val} from '$shared/DataVerse2/atom'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'

type Config = {
  timeD: AbstractDerivation<number>
  interpolationDescriptorP: Pointer<ITimelinePointInterpolationDescriptor>
  leftPointTimeD: AbstractDerivation<number>
  leftPointValueD: AbstractDerivation<number>
  rightPointTimeD: AbstractDerivation<undefined | number>
  rightPointValueD: AbstractDerivation<undefined | number>
}

type Solver = {
  solveSimple(progression: number): number
}

export default function interpolationDerivationForCubicBezier(
  config: Config,
): AbstractDerivation<number> {
  // debugger
  return isConnected(config).flatMap(
    isConnected =>
      isConnected ? interpolatedValue(config) : config.leftPointValueD,
  )
}

const unitBezier = (
  interpolationDescriptorP: Pointer<ITimelinePointInterpolationDescriptor>,
) => {
  return autoDerive(() => {
    const lxD = val(interpolationDescriptorP.handles[0])
    const lyD = val(interpolationDescriptorP.handles[1])
    const rxD = val(interpolationDescriptorP.handles[2])
    const ryD = val(interpolationDescriptorP.handles[3])
    return new UnitBezier(lxD, lyD, 1 - rxD, 1 - ryD)
  })
}

const progression = ({timeD, leftPointTimeD, rightPointTimeD}: Config) => {
  return withDeps(
    {timeD, leftPointTimeD, rightPointTimeD},
    ({timeD, leftPointTimeD, rightPointTimeD}) => {
      const rightPointTime = rightPointTimeD.getValue()
      if (typeof rightPointTime === 'number') {
        const distance = rightPointTime - leftPointTimeD.getValue()
        return (timeD.getValue() - leftPointTimeD.getValue()) / distance
      } else {
        return 0
      }
    },
  )
}

const isConnected = ({interpolationDescriptorP}: Config) =>
  valueDerivation(interpolationDescriptorP.connected)

const interpolatedValue = (config: Config) => {
  const progressionD = progression(config)
  const solverD = unitBezier(config.interpolationDescriptorP)
  const {leftPointValueD, rightPointValueD} = config

  return withDeps(
    {progressionD, solverD, leftPointValueD, rightPointValueD},
    () => {
      // console.log('here')
      // debugger
      const solver: Solver = solverD.getValue()
      const valueProgression = solver.solveSimple(progressionD.getValue())
      const valueDiff =
        ((rightPointValueD.getValue() as $IntentionalAny) as number) -
        leftPointValueD.getValue()
      return leftPointValueD.getValue() + valueProgression * valueDiff
    },
  )
}
