import ComponentNameEditor from '$src/studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ComponentNameEditor'
import TreeEditor from '$src/studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/TreeEditor/TreeEditor'
import ModifiersEditor from './ModifiersEditor/ModifiersEditor'
import React from 'react'
import PureComponentWithStudio from '$studio/componentModel/react/utils/PureComponentWithStudio'
import PropsEditor from './PropsEditor'

type Props = {
  path: Array<string>
  config: {partsToShow: Array<'template' | 'name'>}
}

const partNameToEditorComponent = {
  name: ComponentNameEditor,
  template: TreeEditor,
  props: PropsEditor,
  modifiers: ModifiersEditor,
}

type State = {}

export default class DeclarativeComponentDescriptorEditor extends PureComponentWithStudio<
  Props,
  State
> {
  state = {}

  render() {
    const {config, path} = this.props
    return (
      <>
        {config.partsToShow.map(partName => {
          const C = partNameToEditorComponent[partName]
          if (!C) throw new Error(`bug`)
          return (
            <C key={`editorFor-${partName}`} pathToComponentDescriptor={path} />
          )
        })}
      </>
    )
  }
}
