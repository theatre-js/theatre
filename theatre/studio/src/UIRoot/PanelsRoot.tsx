import OutlinePanel from '@theatre/studio/panels/OutlinePanel/OutlinePanel'
import ObjectEditorPanel from '@theatre/studio/panels/ObjectEditorPanel/ObjectEditorPanel'
import React from 'react'
import SequenceEditorPanel from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'

const PanelsRoot: React.FC = () => {
  return (
    <>
      <OutlinePanel />
      <ObjectEditorPanel />
      <SequenceEditorPanel />
    </>
  )
}

export default PanelsRoot
