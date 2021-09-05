import OutlinePanel from '@theatre/studio/panels/OutlinePanel/OutlinePanel'
import DetailPanel from '@theatre/studio/panels/DetailPanel/DetailPanel'
import React from 'react'
import getStudio from '@theatre/studio/getStudio'
import {useVal} from '@theatre/react'
import PaneWrapper from '@theatre/studio/panels/BasePanel/PaneWrapper'
import SequenceEditorPanel from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'

const PanelsRoot: React.FC = () => {
  const panes = useVal(getStudio().paneManager.allPanesD)
  const paneEls = Object.entries(panes).map(([instanceId, paneInstance]) => {
    return (
      <PaneWrapper key={`pane-${instanceId}`} paneInstance={paneInstance!} />
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
