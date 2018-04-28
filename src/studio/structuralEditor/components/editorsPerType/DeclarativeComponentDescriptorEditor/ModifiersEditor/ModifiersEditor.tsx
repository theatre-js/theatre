<<<<<<< HEAD
import React from 'react'
import * as css from './ModifiersEditor.css'
=======
import {React, connect} from '$src/studio/handy'
>>>>>>> refactor modifiers editor
import PanelSection from '$src/studio/structuralEditor/components/reusables/PanelSection'
import _ from 'lodash'
import StudioComponent from '$src/studio/handy/StudioComponent'
import {getSelectedNodeId} from '$src/studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/TreeEditor/TreeEditor'
import {
  IDeclarativeComponentDescriptor,
  IComponentInstantiationValueDescriptor,
} from '$src/studio/componentModel/types'
// import ListOfModifierInstantiationDescriptorsInspector from './ListOfModifierInstantiationDescriptorsInspector'
// import PaleMessage from '$src/studio/common/components/PaleMessage'
import {IStudioStoreState} from '$studio/types'
import {Subscriber} from 'react-broadcast'
import {PanelActiveModeChannel} from '$studio/workspace/components/Panel/Panel'
import generateUniqueId from 'uuid/v4'
import ModifierSensor from '$studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ModifiersEditor/ModifierSensor'
import ModifierBox from '$studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ModifiersEditor/ModifierBox'
import {STATUS_BY_ACTION, ACTION, STATUS} from './constants'
import {reduceStateAction} from '$shared/utils/redux/commonActions'
interface IOwnProps {
  pathToComponentDescriptor: string[]
}

interface IProps extends IOwnProps {
  componentDescriptor: IDeclarativeComponentDescriptor
  selectedNodeId?: string
  modifierInstantiationDescriptors?: $FixMe
  pathToModifierInstantiationDescriptors?: string[]
}

type Action =
  | {
      type: null
      id: null
    }
  | {
      type: string
      id: string
    }
interface IState {
  dragSourceProps:
    | undefined
    | null
    | {
        boxIndex: number
        modifierId: string
        holeHeight: number
        boxTop: number
      }
  dropZoneProps:
    | undefined
    | null
    | {
        sensorIndex: number
        boxTop: number
      }
}

const SENSOR_HEIGHT = parseInt(require('./ModifierSensor.css').sensorHeight)
class ModifiersEditor extends StudioComponent<IProps, IState> {
  lastAction: Action = {type: null, id: null}

  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {
      dragSourceProps: null,
      dropZoneProps: null,
    }
  }

  private setLastAction(type: string, id: string) {
    this.lastAction = {type, id}
  }

  private unsetLastAction() {
    this.lastAction = {type: null, id: null}
  }

  createBox = (index: number) => {
    const uniqueId = generateUniqueId()
    this.setLastAction(ACTION.BOX_ADD, uniqueId)
    this.dispatch(
      reduceStateAction(
        this.props.pathToModifierInstantiationDescriptors!,
        ({byId, list}) => {
          const newModifier = {
            __descriptorType: 'ModifierInstantiationValueDescriptor',
            enabled: true,
            props: {},
            modifierId: '', //TODO
          }
          return {
            list: list.slice(0, index).concat(uniqueId, list.slice(index)),
            byId: {...byId, [uniqueId]: newModifier},
          }
        },
      ),
    )
  }

  boxDragStartHandler = (
    index: number,
    id: string,
    height: number,
    top: number,
  ) => {
    this.setState(() => ({
      dragSourceProps: {
        boxIndex: index,
        modifierId: id,
        holeHeight: height + SENSOR_HEIGHT,
        boxTop: top,
      },
    }))
  }

  boxDragEndHandler = () => {
    const {state, props} = this
    const {dragSourceProps, dropZoneProps} = state
    this.unsetLastAction()
    this.reduceState(
      props.pathToModifierInstantiationDescriptors!.concat('list'),
      list => {
        const {modifierId} = dragSourceProps!
        let {boxIndex: dragIndex} = dragSourceProps!
        const {sensorIndex: dropIndex} = dropZoneProps!
        list = list
          .slice(0, dropIndex)
          .concat(modifierId)
          .concat(list.slice(dropIndex))
        if (dragIndex > dropIndex) dragIndex = dragIndex + 1
        return list.slice(0, dragIndex).concat(list.slice(dragIndex + 1))
      },
    )

    this.setState(() => ({
      dragSourceProps: null,
      dropZoneProps: null,
    }))
  }

  boxDropHandler = (index: number, top: number) => {
    this.setLastAction(
      ACTION.BOX_DROPPED,
      this.state.dragSourceProps!.modifierId,
    )
    this.setState(() => ({
      dropZoneProps: {
        sensorIndex: index,
        boxTop: top,
      },
    }))
  }

  setModifierType = (id: string, type: string) => {
    this.setLastAction(ACTION.BOX_SET_TYPE, id)
    this.dispatch(
      reduceStateAction(
        this.props.pathToModifierInstantiationDescriptors!.concat('byId', id),
        modifier => {
          return {
            ...modifier,
            modifierId: type,
          }
        },
      ),
    )
  }

  deleteModifier = (modifierId: string) => {
    this.unsetLastAction()
    this.dispatch(
      reduceStateAction(
        this.props.pathToModifierInstantiationDescriptors as string[],
        descriptors => {
          const {[modifierId]: remove, ...byId} = descriptors.byId
          return {
            byId,
            list: descriptors.list.filter((id: string) => id !== modifierId),
          }
        },
      ),
    )
  }

  private getTranslateY(
    index: number,
    isABoxBeingDragged: boolean,
    isABoxBeingDropped: boolean,
  ): number {
    const {dragSourceProps, dropZoneProps} = this.state
    return isABoxBeingDragged
      ? isABoxBeingDropped
        ? dragSourceProps!.boxIndex < index &&
          index < dropZoneProps!.sensorIndex
          ? -dragSourceProps!.holeHeight
          : index < dragSourceProps!.boxIndex &&
            dropZoneProps!.sensorIndex <= index
            ? dragSourceProps!.holeHeight
            : 0
        : dragSourceProps!.boxIndex < index ? -dragSourceProps!.holeHeight : 0
      : 0
  }

  render() {
    const {lastAction, props, state} = this
    const {selectedNodeId, modifierInstantiationDescriptors} = props
    const {dragSourceProps, dropZoneProps} = state
    const isABoxBeingDragged = dragSourceProps != null
    const isABoxBeingDropped = dropZoneProps != null

    const modifiersList =
      modifierInstantiationDescriptors != null
        ? modifierInstantiationDescriptors.list
        : []

    return selectedNodeId != null ? (
      <Subscriber channel={PanelActiveModeChannel}>
        {({activeMode}: {activeMode: string}) => {
          return (
            <PanelSection
              withHorizontalMargin={false}
              withoutBottomMargin={true}
            >
              <div>
                <ModifierSensor
                  index={0}
                  activeMode={activeMode}
                  translateY={0}
                  isABoxBeingDragged={isABoxBeingDragged}
                  onClick={this.createBox}
                  onDrop={this.boxDropHandler}
                />
                {modifiersList.map((modifierId: string, index: number) => {
                  // @ts-ignore
                  const modifier = modifierInstantiationDescriptors.byId[
                    modifierId
                  ].modifierId
                    .split('/')
                    .slice(-1)
                  const status =
                    lastAction.id === modifierId
                      ? STATUS_BY_ACTION[lastAction.type!]
                      : STATUS_BY_ACTION.DEFAULT
                  const translateY =
                    status === STATUS.DROPPED
                      ? dropZoneProps!.boxTop - dragSourceProps!.boxTop
                      : this.getTranslateY(
                          index,
                          isABoxBeingDragged,
                          isABoxBeingDropped,
                        )
                  return (
                    <React.Fragment key={modifierId}>
                      <ModifierBox
                        status={status}
                        title={modifier}
                        index={index}
                        modifierId={modifierId}
                        activeMode={activeMode}
                        translateY={translateY}
                        isABoxBeingDragged={isABoxBeingDragged}
                        onDragStart={this.boxDragStartHandler}
                        onDragEnd={this.boxDragEndHandler}
                        setModifierType={this.setModifierType}
                        deleteModifier={this.deleteModifier}
                      />
                      <ModifierSensor
                        index={index + 1}
                        activeMode={activeMode}
                        translateY={translateY}
                        isABoxBeingDragged={isABoxBeingDragged}
                        onClick={this.createBox}
                        onDrop={this.boxDropHandler}
                      />
                    </React.Fragment>
                  )
                })}
              </div>
            </PanelSection>
          )
        }}
      </Subscriber>
    ) : null
  }

  // return null
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

export default connect((s: IStudioStoreState, op: IOwnProps) => {
  const componentDescriptor = _.get(s, op.pathToComponentDescriptor)
  const selectedNodeId = getSelectedNodeId(componentDescriptor)
  const possibleHiddenValue =
    selectedNodeId && componentDescriptor.localHiddenValuesById[selectedNodeId]

  if (
    !selectedNodeId ||
    !possibleHiddenValue ||
    typeof possibleHiddenValue !== 'object' ||
    Array.isArray(possibleHiddenValue)
  ) {
    return {
      componentDescriptor,
    }
  }

  let pathToModifierInstantiationDescriptors, modifierInstantiationDescriptors
  if (
    // @ts-ignore
    possibleHiddenValue.__descriptorType ===
    'ComponentInstantiationValueDescriptor'
  ) {
    const instantiationValueDescriptor: IComponentInstantiationValueDescriptor = possibleHiddenValue as $IntentionalAny
    const pathToLocalHiddenValueId = [
      ...op.pathToComponentDescriptor,
      'localHiddenValuesById',
      selectedNodeId,
    ]

    pathToModifierInstantiationDescriptors = [
      ...pathToLocalHiddenValueId,
      'modifierInstantiationDescriptors',
    ]
    modifierInstantiationDescriptors =
      instantiationValueDescriptor.modifierInstantiationDescriptors

    return {
      selectedNodeId,
      componentDescriptor,
      modifierInstantiationDescriptors,
      pathToModifierInstantiationDescriptors,
    }
  }

  return {
    componentDescriptor,
  }
})(ModifiersEditor as React.ComponentClass<any>)
