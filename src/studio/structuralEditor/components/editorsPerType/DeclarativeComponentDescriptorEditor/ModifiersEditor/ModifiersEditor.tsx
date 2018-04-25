import React from 'react'
import * as css from './ModifiersEditor.css'
import PanelSection from '$src/studio/structuralEditor/components/reusables/PanelSection'
import * as _ from 'lodash'
import StudioComponent from '$src/studio/handy/StudioComponent'
import {getSelectedNodeId} from '$src/studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/TreeEditor/TreeEditor'
import {
  IDeclarativeComponentDescriptor,
  IComponentInstantiationValueDescriptor,
} from '$src/studio/componentModel/types'
import ListOfModifierInstantiationDescriptorsInspector from './ListOfModifierInstantiationDescriptorsInspector'
import PaleMessage from '$src/studio/common/components/PaleMessage'
import {IStudioStoreState} from '$studio/types'
import connect from '$studio/handy/connect'

interface IOwnProps {
  pathToComponentDescriptor: string[]
}

interface IProps extends IOwnProps {
  componentDescriptor: IDeclarativeComponentDescriptor
}

type State = {}

class ModifiersEditor extends StudioComponent<IProps, State> {
  state = {}

  render() {
    const {componentDescriptor, pathToComponentDescriptor} = this.props
    const selectedNodeId = getSelectedNodeId(componentDescriptor)
    const possibleHiddenValue =
      selectedNodeId &&
      componentDescriptor.localHiddenValuesById[selectedNodeId]

    if (
      !selectedNodeId ||
      !possibleHiddenValue ||
      typeof possibleHiddenValue !== 'object' ||
      Array.isArray(possibleHiddenValue)
    ) {
      return null
    }

    if (
      // @ts-ignore
      possibleHiddenValue.__descriptorType ===
      'ComponentInstantiationValueDescriptor'
    ) {
      const instantiationValueDescriptor: IComponentInstantiationValueDescriptor = possibleHiddenValue as $IntentionalAny
      const pathToLocalHiddenValueId = [
        ...pathToComponentDescriptor,
        'localHiddenValuesById',
        selectedNodeId,
      ]

      const pathToModifierInstantiationDescriptors = [
        ...pathToLocalHiddenValueId,
        'modifierInstantiationDescriptors',
      ]
      const modifierInstantiationDescriptors =
        instantiationValueDescriptor.modifierInstantiationDescriptors

      return (
        <div className={css.container}>
          <PanelSection label="Modifiers" withHorizontalMargin={false}>
            <ListOfModifierInstantiationDescriptorsInspector
              pathToModifierInstantiationDescriptors={
                pathToModifierInstantiationDescriptors
              }
              modifierInstantiationDescriptors={
                modifierInstantiationDescriptors
              }
            />
            <PaleMessage
              style="paler"
              message={`Add more modifiers by CMD+Clicking after or in-between other modifiers`}
            />
          </PanelSection>
        </div>
      )
    }

    possibleHiddenValue

    return null
  }
}

export default connect((s: IStudioStoreState, op: IOwnProps) => {
  return {
    componentDescriptor: _.get(s, op.pathToComponentDescriptor),
  }
})(ModifiersEditor)
