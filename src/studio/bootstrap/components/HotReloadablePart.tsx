// @flow
import RootRoutes from './RootRoutes'
import * as React from 'react'

/**
 * Hack to enable hot-reloading the components higher up the component tree
 */
const HotReloadablePart = () => <RootRoutes />

export default HotReloadablePart
