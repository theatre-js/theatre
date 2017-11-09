// @flow

import * as React from 'react'
import compose from 'ramda/src/compose'
import {connect} from '$lf/utils'
import {getIsBootstrapped} from '$lf/common/selectors'
import SplashScreen from '$lf/common/components/SplashScreen'

import type {StoreState} from '$lf/types'

type Props = {
  isBootstrapped: boolean,
  children?: any,
}

const SplashUnlessBootstrapped = (props: Props) => {
  return !props.isBootstrapped ? <SplashScreen /> : props.children
}

/**
 * Shows a splash screen, unless we're bootstrapped (see bootstrapped in $common/reducer)
 */
export default compose(
  connect((state: StoreState) => ({
    isBootstrapped: getIsBootstrapped(state),
  })),
)(SplashUnlessBootstrapped)
