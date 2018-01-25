// @flow
import RootRoutes from './RootRoutes'
import * as React from 'react'

/**
 * Hack to enable hot-reloading the components higher up the component tree
 */
const HotReloadablePartsOfApp = () => <RootRoutes />

export default HotReloadablePartsOfApp
