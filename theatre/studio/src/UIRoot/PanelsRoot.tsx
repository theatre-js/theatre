import OutlinePanel from '@theatre/studio/panels/OutlinePanel/OutlinePanel'
import DetailPanel from '@theatre/studio/panels/DetailPanel/DetailPanel'
import React from 'react'
import getStudio from '@theatre/studio/getStudio'
import {useVal} from '@theatre/react'
import ExtensionPaneWrapper from '@theatre/studio/panels/BasePanel/ExtensionPaneWrapper'
import SequenceEditorPanel from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'

const PanelsRoot: React.VFC = () => {
  const panes = useVal(getStudio().paneManager.allPanesD)
  const paneEls = Object.entries(panes).map(([instanceId, paneInstance]) => {
    return (
      <ExtensionPaneWrapper
        key={`pane-${instanceId}`}
        paneInstance={paneInstance!}
      />
    )
  })

  return (
    <>
      {paneEls}
      <OutlinePanel />
      <DetailPanel />
      <SequenceEditorPanel />
    </>
  )
}

export default PanelsRoot
