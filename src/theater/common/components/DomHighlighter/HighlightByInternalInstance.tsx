import React from 'react'
import {isElement} from 'lodash-es'
import DomHighlighter from '$theater/common/components/DomHighlighter/DomHighlighter'

interface IProps {
  rendererId: string
  internalInstance: $FixMe
  children: (showOverlay?: () => any, hideOverlay?: () => any) => any
}

const HighlightByInternalInstance = ({
  rendererId,
  internalInstance,
  children,
}: IProps) => {
  const domEl = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.helpers[
    rendererId
  ].getNativeFromReactElement(internalInstance)

  return isElement(domEl) ? (
    <DomHighlighter domEl={domEl}>{children}</DomHighlighter>
  ) : (
    children()
  )
}

export default HighlightByInternalInstance
