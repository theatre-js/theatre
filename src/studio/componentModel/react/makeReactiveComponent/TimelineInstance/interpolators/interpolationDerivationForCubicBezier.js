// @flow
import * as D from '$shared/DataVerse'
import UnitBezier from 'timing-function/lib/UnitBezier'

type Config = {
  timeD: D.IDerivation<number>,
  interpolationDescriptorP: $FixMe,
  leftPointTimeD: D.IDerivation<number>,
  leftPointValueD: D.IDerivation<$FixMe>,
  rightPointTimeD: D.IDerivation<?number>,
  rightPointValueD: D.IDerivation<$FixMe>,
}

type Solver = {
  solveSimple(progression: number): number,
}

export default function interpolationDerivationForCubicBezier(
  config: Config,
): D.IDerivation<$FixMe> {
  // debugger
  return isConnected(config).flatMap(
    isConnected =>
      isConnected ? interpolatedValue(config) : config.leftPointValueD,
  )
}

const unitBezier = (interpolationDescriptorP: $FixMe) => {
  return D.derivations.withDeps(
    {
      lxD: interpolationDescriptorP.prop('lx'),
      lyD: interpolationDescriptorP.prop('ly'),
      rxD: interpolationDescriptorP.prop('rx'),
      ryD: interpolationDescriptorP.prop('ry'),
    },
    ({lxD, lyD, rxD, ryD}) => {
      return new UnitBezier(
        lxD.getValue(),
        lyD.getValue(),
        rxD.getValue(),
        ryD.getValue(),
      )
    },
  )
}

const progression = ({timeD, leftPointTimeD, rightPointTimeD}: Config) => {
  return D.derivations.withDeps(
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
  interpolationDescriptorP.prop('connected')

const interpolatedValue = (config: Config) => {
  const progressionD = progression(config)
  const solverD = unitBezier(config.interpolationDescriptorP)
  const {leftPointValueD, rightPointValueD} = config

  return D.derivations.withDeps(
    {progressionD, solverD, leftPointValueD, rightPointValueD},
    () => {
      // console.log('here')
      // debugger
      const solver: Solver = solverD.getValue()
      const valueProgression = solver.solveSimple(progressionD.getValue())
      const valueDiff = rightPointValueD.getValue() - leftPointValueD.getValue()
      return leftPointValueD.getValue() + valueProgression * valueDiff
    },
  )
}
