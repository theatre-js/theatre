import fn from './getProjectState.studioSocketEndpoint'
import wrapLBEndpointForStudio, {
  WrapLBEndpointForStudio,
} from '$studio/commsWithLB/wrapLBEndpointForStudio'

const getProjectState: WrapLBEndpointForStudio<
  typeof fn
> = wrapLBEndpointForStudio('getProjectState')

export default getProjectState
