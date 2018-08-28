import {RequestFn} from '$theater/commsWithLB/LBCommunicator'

export type WrapLBEndpointForStudio<Fn extends Function> = Fn extends (
  params: infer Params,
) => Generator_<infer PossibleResults>
  ? Wrapped<Params, PossibleResults>
  : never

type Wrapped<Params, PossibleResults> = (
  params: Params,
) => (request: RequestFn) => Promise<PossibleResults>

const wrapLBEndpointForStudio = ((endpointName: string) => (
  params: $IntentionalAny,
) => (request: RequestFn) =>
  request(
    endpointName,
    params,
    `I promise I'm calling LBCommunicator._request from wrapLBEndpointForStudio`,
  )) as $FixMe

export default wrapLBEndpointForStudio
