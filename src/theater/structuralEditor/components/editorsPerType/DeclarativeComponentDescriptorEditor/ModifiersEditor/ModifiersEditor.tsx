import React from 'react'
import connect from '$theater/handy/connect'
import PanelSection from '$theater/structuralEditor/components/reusables/PanelSection'
import * as _ from 'lodash-es'
import PureComponentWithTheater from '$theater/handy/PureComponentWithTheater'
import {getSelectedNodeId} from '$theater/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/TreeEditor/TreeEditor'
import {IDeclarativeComponentDescriptor} from '$theater/componentModel/types'
import {Subscriber} from 'react-broadcast'
import {PanelActiveModeChannel} from '$theater/workspace/components/Panel/Panel'
import generateUniqueId from 'uuid/v4'
import ModifierSensor from '$theater/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ModifiersEditor/ModifierSensor'
import ModifierBox from '$theater/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ModifiersEditor/ModifierBox'
import {STATUS_BY_ACTION, ACTION, STATUS} from './constants'
import {reduceStateAction} from '$shared/utils/redux/commonActions'
import {ITheaterStoreState} from '$theater/types'
interface IOwnProps {
  pathToComponentDescriptor: string[]
}

interface IProps extends IOwnProps {
  componentDescriptor: IDeclarativeComponentDescriptor
  selectedNodeId?: string
  listOfModifierInstantiationDescriptors: string[]
  pathToModifierInstantiationDescriptors?: string[]
}

type Action = null | {
  type: string
  descriptorId: string
}
interface IState {
  lastAction: Action
  dragSourceProps:
    | undefined
    | null
    | {
        boxIndex: number
        descriptorId: string
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
class ModifiersEditor extends PureComponentWithTheater<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {
      dragSourceProps: null,
      dropZoneProps: null,
      lastAction: null,
    }
  }

  addModifier = (index: number) => {
    const uniqueId = generateUniqueId()
    this.setState(() => ({
      lastAction: {
        type: ACTION.add,
        descriptorId: uniqueId,
      },
    }))
    this.dispatch(
      reduceStateAction(
        this.props.pathToModifierInstantiationDescriptors!,
        ({byId, list}) => {
          const newModifier = {
            __descriptorType: 'ModifierInstantiationValueDescriptor',
            enabled: false,
            props: {},
            modifierId: 'TheaterJS/Core/HTML/UberModifier',
          }
          return {
            list: list.slice(0, index).concat(uniqueId, list.slice(index)),
            byId: {...byId, [uniqueId]: newModifier},
          }
        },
      ),
    )
  }

  dragStartHandler = (
    index: number,
    id: string,
    height: number,
    top: number,
  ) => {
    this.setState(() => ({
      lastAction: {
        type: ACTION.startDrag,
        descriptorId: id,
      },
      dragSourceProps: {
        boxIndex: index,
        descriptorId: id,
        holeHeight: height + SENSOR_HEIGHT,
        boxTop: top,
      },
    }))
  }

  dragEndHandler = () => {
    const {dragSourceProps, dropZoneProps} = this.state
    if (dropZoneProps == null) {
      this.setState(() => ({
        lastAction: {
          type: ACTION.cancelMove,
          descriptorId: dragSourceProps!.descriptorId,
        },
      }))
    } else {
      this.setState(() => ({
        lastAction: {
          type: ACTION.move,
          descriptorId: dragSourceProps!.descriptorId,
        },
      }))
    }
  }

  dropHandler = (index: number, top: number) => {
    this.setState(({dragSourceProps}) => ({
      lastAction: {
        type: ACTION.drop,
        descriptorId: dragSourceProps!.descriptorId,
      },
      dropZoneProps: {
        sensorIndex: index,
        boxTop: top,
      },
    }))
  }

  setModifierType = (id: string, type: string) => {
    this.setState(() => ({
      lastAction: {
        type: ACTION.setType,
        descriptorId: id,
      },
    }))
    this.dispatch(
      reduceStateAction(
        this.props.pathToModifierInstantiationDescriptors!.concat('byId', id),
        modifier => {
          return {
            ...modifier,
            modifierId: type,
            enabled: true,
          }
        },
      ),
    )
  }

  moveModifier = () => {
    const {dragSourceProps, dropZoneProps} = this.state
    if (dragSourceProps != null && dropZoneProps != null) {
      this.reduceState(
        this.props.pathToModifierInstantiationDescriptors!.concat('list'),
        list => {
          const {descriptorId} = dragSourceProps
          let {boxIndex: dragIndex} = dragSourceProps
          const {sensorIndex: dropIndex} = dropZoneProps
          list = list
            .slice(0, dropIndex)
            .concat(descriptorId)
            .concat(list.slice(dropIndex))
          if (dragIndex > dropIndex) dragIndex = dragIndex + 1
          return list.slice(0, dragIndex).concat(list.slice(dragIndex + 1))
        },
      )
    }
    this.setState(() => ({
      lastAction: null,
      dragSourceProps: null,
      dropZoneProps: null,
    }))
  }

  deleteModifier = (id: string) => {
    this.setState(() => ({
      lastAction: null,
    }))
    this.dispatch(
      reduceStateAction(
        this.props.pathToModifierInstantiationDescriptors as string[],
        descriptors => {
          const {[id]: remove, ...byId} = descriptors.byId
          return {
            byId,
            list: descriptors.list.filter(
              (descriptorId: string) => descriptorId !== id,
            ),
          }
        },
      ),
    )
  }

  private getTranslateY(index: number, status: string): number {
    const {dragSourceProps, dropZoneProps, lastAction} = this.state
    if (lastAction && lastAction.type === ACTION.cancelMove) return 0
    const isABoxBeingDragged = dragSourceProps != null
    const isABoxBeingDropped = dropZoneProps != null
    return status === STATUS.moved
      ? dropZoneProps!.boxTop - dragSourceProps!.boxTop
      : isABoxBeingDragged
        ? isABoxBeingDropped
          ? dragSourceProps!.boxIndex < index &&
            index < dropZoneProps!.sensorIndex
            ? -dragSourceProps!.holeHeight
            : index < dragSourceProps!.boxIndex &&
              dropZoneProps!.sensorIndex <= index
              ? dragSourceProps!.holeHeight
              : 0
          : dragSourceProps!.boxIndex < index
            ? -dragSourceProps!.holeHeight
            : 0
        : 0
  }

  render() {
    const {props, state} = this
    const {
      selectedNodeId,
      listOfModifierInstantiationDescriptors,
      pathToModifierInstantiationDescriptors,
    } = props
    const {dragSourceProps, lastAction} = state
    const isABoxBeingDragged = dragSourceProps != null

    return selectedNodeId != null ? (
      <Subscriber channel={PanelActiveModeChannel}>
        {(activeMode: string) => {
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
                  onClick={this.addModifier}
                  onDrop={this.dropHandler}
                />
                {(listOfModifierInstantiationDescriptors || []).map(
                  (id: string, index: number) => {
                    const status =
                      lastAction && lastAction.descriptorId === id
                        ? STATUS_BY_ACTION[lastAction.type]
                        : STATUS_BY_ACTION.default
                    const translateY = this.getTranslateY(index, status)

                    return (
                      <React.Fragment key={id}>
                        <ModifierBox
                          status={status}
                          index={index}
                          descriptorId={id}
                          activeMode={activeMode}
                          translateY={translateY}
                          isABoxBeingDragged={isABoxBeingDragged}
                          onDragStart={this.dragStartHandler}
                          onDragEnd={this.dragEndHandler}
                          setModifierType={this.setModifierType}
                          deleteModifier={this.deleteModifier}
                          moveModifier={this.moveModifier}
                          pathToModifierInstantiationDescriptors={
                            pathToModifierInstantiationDescriptors!
                          }
                        />
                        <ModifierSensor
                          index={index + 1}
                          activeMode={activeMode}
                          translateY={translateY}
                          isABoxBeingDragged={isABoxBeingDragged}
                          onClick={this.addModifier}
                          onDrop={this.dropHandler}
                        />
                      </React.Fragment>
                    )
                  },
                )}
              </div>
            </PanelSection>
          )
        }}
      </Subscriber>
    ) : null
  }
}

export default connect((s: ITheaterStoreState, op: IOwnProps) => {
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

  let pathToModifierInstantiationDescriptors
  if (
    // @ts-ignore
    possibleHiddenValue.__descriptorType ===
    'ComponentInstantiationValueDescriptor'
  ) {
    const pathToLocalHiddenValueId = [
      ...op.pathToComponentDescriptor,
      'localHiddenValuesById',
      selectedNodeId,
    ]

    pathToModifierInstantiationDescriptors = [
      ...pathToLocalHiddenValueId,
      'modifierInstantiationDescriptors',
    ]

    const listOfModifierInstantiationDescriptors = _.get(
      s,
      pathToModifierInstantiationDescriptors.concat('list'),
    )

    return {
      selectedNodeId,
      componentDescriptor,
      listOfModifierInstantiationDescriptors,
      pathToModifierInstantiationDescriptors,
    }
  }

  return {
    componentDescriptor,
  }
})(ModifiersEditor as React.ComponentClass<any>)
