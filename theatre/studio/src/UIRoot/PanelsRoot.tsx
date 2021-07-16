import OutlinePanel from '@theatre/studio/panels/OutlinePanel/OutlinePanel'
import ObjectEditorPanel from '@theatre/studio/panels/ObjectEditorPanel/ObjectEditorPanel'
import React from 'react'
import getStudio from '@theatre/studio/getStudio'
import {useVal} from '@theatre/dataverse-react'
import PaneWrapper from '@theatre/studio/panels/BasePanel/PaneWrapper'

const PanelsRoot: React.FC = () => {
  const panes = useVal(getStudio().paneManager.allPanesD)
  const paneEls = Object.entries(panes).map(([instanceId, paneInstance]) => {
    return (
      <PaneWrapper key={`pane-${instanceId}`} paneInstance={paneInstance!} />
    )
  })

  return (
    <>
      {/* {paneEls} */}
      <OutlinePanel />
      <ObjectEditorPanel />
      {/* <SequenceEditorPanel /> */}
    </>
  )
}

export default PanelsRoot
