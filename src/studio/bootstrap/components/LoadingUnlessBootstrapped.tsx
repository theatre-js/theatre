// This will be some sort of loading indicator to show before the studio is ready to function

import * as React from 'react'
import {compose} from 'ramda'
import {connect} from '$studio/handy'
import {getIsHydrated} from '$studio/common/selectors'

import {IStudioStoreState} from '$studio/types'

type Props = {
  isHydrated: boolean
  children?: any
}

const LoadingUnlessHydrated = (props: Props) => {
  return !props.isHydrated ? <div>Loading...</div> : props.children
}

/**
 * Shows a splash screen, unless we're bootstrapped (see bootstrapped in $common/reducer)
 */
export default compose(
  connect((state: IStudioStoreState) => ({
    isHydrated: getIsHydrated(state),
  })),
)(LoadingUnlessHydrated)
