import fn from './pushDiffForProjectState.studioSocketEndpoint'
import wrapLBEndpointForStudio, {
  WrapLBEndpointForStudio,
} from '$studio/commsWithLB/wrapLBEndpointForStudio'

const pushDiffForProjectState: WrapLBEndpointForStudio<
  typeof fn
> = wrapLBEndpointForStudio('pushDiffForProjectState')

export default pushDiffForProjectState