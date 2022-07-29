import type React from 'react'
import {memoize} from 'lodash-es'

export const getDepthVarStyle: (depth: number) => React.CSSProperties = memoize(
  function _getDepthVarStyle(depth: number): React.CSSProperties {
    return {
      // @ts-ignore
      '--depth': depth,
    }
  },
)
