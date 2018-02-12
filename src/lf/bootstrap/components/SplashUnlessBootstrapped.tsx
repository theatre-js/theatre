import * as React from 'react'
import {getIsBootstrapped} from '$lf/common/selectors'
import SplashScreen from '$lf/common/components/SplashScreen'

import {StoreState} from '$lf/types'
import {connect} from 'react-redux'

type Props = {
  isBootstrapped: boolean
  children?: any
}

const SplashUnlessBootstrapped = (props: Props) => {
  return !props.isBootstrapped ? <SplashScreen /> : props.children
}

/**
 * Shows a splash screen, unless we're bootstrapped (see bootstrapped in $common/reducer)
 */
export default connect((state: StoreState) => ({
  isBootstrapped: getIsBootstrapped(state, void 0),
}))(SplashUnlessBootstrapped)
