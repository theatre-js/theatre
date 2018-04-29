import React from 'react'
import PureComponentWithStudio from '$studio/componentModel/react/utils/PureComponentWithStudio'
import SceneSelector from './SceneSelector'
import DimensionsEditor from './DimensionsEditor'

type Props = {
  viewportId: string
  partsToShow: Array<'dims' | 'scene'>
}

const partNameToEditorComponent = {
  scene: SceneSelector,
  dims: DimensionsEditor
}

type State = {}

export default class DeclarativeComponentDescriptorEditor extends PureComponentWithStudio<
  Props,
  State
> {
  state = {}

  render() {
    const {viewportId, partsToShow} = this.props
    return (
      <>
        {partsToShow.map(partName => {
          const C = partNameToEditorComponent[partName]
          if (!C) throw new Error(`bug`)
          return <C key={`editorFor-${partName}`} viewportId={viewportId} />
        })}
      </>
    )
  }
}
