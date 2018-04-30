import fn from './getProjectState.studioSocketEndpoint'
import wrapLBEndpointForStudio, {
  WrapLBEndpointForStudio,
} from '$theater/commsWithLB/wrapLBEndpointForStudio'

const getProjectState: WrapLBEndpointForStudio<
  typeof fn
> = wrapLBEndpointForStudio('getProjectState')

export default getProjectState
