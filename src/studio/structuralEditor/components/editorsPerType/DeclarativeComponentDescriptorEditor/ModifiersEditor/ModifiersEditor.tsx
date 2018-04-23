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
import {Subscriber} from 'react-broadcast'
import {PanelActiveModeChannel} from '$studio/workspace/components/Panel/Panel'

import ModifierSensor from '$studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ModifiersEditor/ModifierSensor'
import ModifierBox from '$studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ModifiersEditor/ModifierBox'

interface IOwnProps {
  pathToComponentDescriptor: string[]
}

interface IProps extends IOwnProps {
  componentDescriptor: IDeclarativeComponentDescriptor
}

type State = {
  modifiers: string[],
  boxBeingDraggedIndex: null | number,
}

const modifierTypes = ['translate', 'rotate', 'scale', 'skew']
const modifierDirs = ['X', 'Y', 'Z']

class ModifiersEditor extends StudioComponent<IProps, State> {
  state = {
    modifiers: ['opacity'],
    boxBeingDraggedIndex: null,
  }

  createBox = (index: number) => {
    this.setState(({modifiers}) => {
      const newModifier = [
        modifierTypes[Math.floor(Math.random() * modifierTypes.length)],
        modifierDirs[Math.floor(Math.random() * modifierDirs.length)],
      ].join('')
      return {
        modifiers: modifiers
          .slice(0, index)
          .concat(newModifier, modifiers.slice(index)),
      }
    })
  }

  boxDragStartHandler = (index: number) => {
    this.setState(() => ({boxBeingDraggedIndex: index}))
  }

  boxDragEndHandler = () => {
    this.setState(() => ({boxBeingDraggedIndex: null}))
  }

  boxDropHandler = (index: number) => {
    let {boxBeingDraggedIndex} = this.state
    if (boxBeingDraggedIndex == null) return
    let {modifiers} = this.state

    const modifierToMove = modifiers[boxBeingDraggedIndex]
    modifiers = modifiers
      .slice(0, index)
      .concat(modifierToMove)
      .concat(modifiers.slice(index))
    if (boxBeingDraggedIndex > index) boxBeingDraggedIndex++
    modifiers = modifiers
      .slice(0, boxBeingDraggedIndex)
      .concat(modifiers.slice(boxBeingDraggedIndex + 1))

    this.setState(() => ({modifiers}))
  }

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

      const {boxBeingDraggedIndex} = this.state
      const isABoxBeingDragged = boxBeingDraggedIndex != null
      return (
        <Subscriber channel={PanelActiveModeChannel}>
          {({activeMode}: {activeMode: string}) => {
            return (
              <PanelSection
                withHorizontalMargin={false}
                withoutBottomMargin={true}
              >
                <div>
                  {this.state.modifiers.map((modifier, index) => {
                    return [
                      <ModifierSensor
                        key={`sensor-${index}`}
                        index={index}
                        activeMode={activeMode}
                        isABoxBeingDragged={isABoxBeingDragged}
                        onClick={this.createBox}
                        onDrop={this.boxDropHandler}
                      />,
                      <ModifierBox
                        key={`box-${index}`}
                        title={modifier}
                        index={index}
                        activeMode={activeMode}
                        isABoxBeingDragged={isABoxBeingDragged}
                        onDragStart={this.boxDragStartHandler}
                        onDragEnd={this.boxDragEndHandler}
                      />,
                    ]
                  })}
                  <ModifierSensor
                    index={this.state.modifiers.length}
                    activeMode={activeMode}
                    isABoxBeingDragged={isABoxBeingDragged}
                    onClick={this.createBox}
                    onDrop={this.boxDropHandler}
                  />
                </div>
              </PanelSection>
            )
          }}
        </Subscriber>
      )
    }

    // possibleHiddenValue

    return null
    //     return (
    //       <div className={css.container}>
    //         <PanelSection label="Modifiers" withHorizontalMargin={false}>
    //           <ListOfModifierInstantiationDescriptorsInspector
    //             pathToModifierInstantiationDescriptors={
    //               pathToModifierInstantiationDescriptors
    //             }
    //             modifierInstantiationDescriptors={
    //               modifierInstantiationDescriptors
    //             }
    //           />
    //           <PaleMessage
    //             style="paler"
    //             message={`Add more modifiers by CMD+Clicking after or in-between other modifiers`}
    //           />
    //         </PanelSection>
    //       </div>
    //     )
    //   }
  }
}

export default connect((s: IStudioStoreState, op: IOwnProps) => {
  return {
    componentDescriptor: _.get(s, op.pathToComponentDescriptor),
  }
})(ModifiersEditor)
