// @flow
// This will be some sort of loading indicator to show before the studio is ready to function

import * as React from 'react'
import compose from 'ramda/src/compose'
import {connect} from '$studio/handy'
import {getIsBootstrapped} from '$studio/common/selectors'

import {IStoreState} from '$studio/types'

type Props = {
  isBootstrapped: boolean
  children?: any
}

const LoadingUnlessBootstrapped = (props: Props) => {
  return !props.isBootstrapped ? <div>Loading...</div> : props.children
}

/**
 * Shows a splash screen, unless we're bootstrapped (see bootstrapped in $common/reducer)
 */
export default compose(
  connect((state: IStoreState) => ({
    isBootstrapped: getIsBootstrapped(state) || true,
  })),
)(LoadingUnlessBootstrapped)
