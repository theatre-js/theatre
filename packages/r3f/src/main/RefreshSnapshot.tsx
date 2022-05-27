import React, {useEffect} from 'react'
import {refreshSnapshot} from './utils'

/**
 * Putting this element in a suspense tree makes sure the snapshot editor
 * gets refreshed once the tree renders.
 *
 * Alternatively you can use {@link refreshSnapshot}
 *
 * @example
 * Usage
 * ```jsx
 * <Suspense fallback={null}>
 *  <RefreshSnapshot />
 *  <Model url={sceneGLB} />
 * </Suspense>
 * ```
 */
const RefreshSnapshot: React.FC<{}> = () => {
  useEffect(() => {
    setTimeout(() => {
      refreshSnapshot()
    })
  }, [])
  return <></>
}

export default RefreshSnapshot
