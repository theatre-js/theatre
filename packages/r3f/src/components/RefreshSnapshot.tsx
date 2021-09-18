import React, {useEffect} from 'react'
import useRefreshSnapshot from './useRefreshSnapshot'

/**
 * Putting this element in a suspense tree makes sure the snapshot editor
 * gets refreshed once the tree renders.
 *
 * Alternatively you can use
 * @link useRefreshSnapshot()
 *
 * Usage
 * ```jsx
 * <Suspense fallback={null}>
 *  <RefreshSnapshot />
 *  <Model url={sceneGLB} />
 * </Suspense>
 * ```
 */
const RefreshSnapshot: React.FC<{}> = (props) => {
  const refreshSnapshot = useRefreshSnapshot()
  useEffect(() => {
    refreshSnapshot()
  }, [])
  return <></>
}

export default RefreshSnapshot
