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
import generateUniqueId from 'uuid/v4'
import ModifierSensor from '$studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ModifiersEditor/ModifierSensor'
import ModifierBox from '$studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ModifiersEditor/ModifierBox'
import {STATUS_BY_ACTION, ACTION} from './constants'
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

type ActionPayload = {
  id?: string
}
type Action = {
  type: string
  payload: ActionPayload
}
type LastAction = undefined | null | Action
interface IState {
  modifiersStatus?: $FixMe
  boxBeingDraggedIndex: undefined | null | number
  lastAction: LastAction
}

const modifierTypes = ['translate', 'rotate', 'scale', 'skew']
const modifierDirs = ['X', 'Y', 'Z']

class ModifiersEditor extends StudioComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    const {modifierInstantiationDescriptors} = props
    this.state = {
      boxBeingDraggedIndex: null,
      lastAction: null,
      ...(modifierInstantiationDescriptors != null
        ? {
            modifiersStatus: this.getModifiersStatus(
              modifierInstantiationDescriptors,
            ),
          }
        : {}),
    }
  }

  componentWillReceiveProps(nextProps: IProps) {
    const {modifierInstantiationDescriptors} = nextProps
    if (modifierInstantiationDescriptors != null) {
      this.setModifiersStatus(modifierInstantiationDescriptors)
    }
  }

  private setModifiersStatus(modifierInstantiationDescriptors: $FixMe) {
    this.setState(({lastAction}) => ({
      lastAction: null,
      modifiersStatus: this.getModifiersStatus(
        modifierInstantiationDescriptors,
        lastAction,
      ),
    }))
  }

  private getModifiersStatus = _.memoize(
    (modifierInstantiationDescriptors: $FixMe, lastAction: LastAction = null) => {
      return Object.keys(modifierInstantiationDescriptors.byId).reduce(
        (reducer, key: string) => {
          return (reducer = {
            ...reducer,
            [key]: this.getComponentStatusAndActionPayload(key, lastAction),
          })
        },
        {},
      )
    },
  )

  private getComponentStatusAndActionPayload(
    id: string,
    lastAction: LastAction,
  ): {status: string; actionPayload: ActionPayload} {
    let status: string = STATUS_BY_ACTION.DEFAULT,
      actionPayload = {}
    if (lastAction != null && lastAction.payload.id === id) {
      const {id, ...payload} = lastAction.payload
      status = STATUS_BY_ACTION[lastAction.type]
      actionPayload = payload
    }
    return {status, actionPayload}
  }

  createBox = (index: number) => {
    const uniqueId = generateUniqueId()
    this.setState(() => ({
      lastAction: {type: ACTION.BOX_ADD, payload: {id: uniqueId}}
    }))
    this.dispatch(
      reduceStateAction(
        this.props.pathToModifierInstantiationDescriptors!,
        ({byId, list}) => {
          const newModifier = {
            __descriptorType: 'ModifierInstantiationValueDescriptor',
            enabled: true,
            props: {},
            modifierId: [
              modifierTypes[Math.floor(Math.random() * modifierTypes.length)],
              modifierDirs[Math.floor(Math.random() * modifierDirs.length)],
            ].join(''),
          }
          return {
            list: list.slice(0, index).concat(uniqueId, list.slice(index)),
            byId: {...byId, [uniqueId]: newModifier},
          }
        },
      ),
    )
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
    const {modifierInstantiationDescriptors: {list}} = this.props
    const modifierId = list[boxBeingDraggedIndex]
    this.setState(() => ({
      lastAction: {type: ACTION.BOX_MOVE, payload: {id: modifierId}}
    }))
    this.dispatch(
      reduceStateAction(
        this.props.pathToModifierInstantiationDescriptors!.concat('list'),
        (list) => {
          list = list
            .slice(0, index)
            .concat(modifierId)
            .concat(list.slice(index))
          // TODO: get rid of non-null assertion operators!
          if (boxBeingDraggedIndex! > index) boxBeingDraggedIndex = boxBeingDraggedIndex! + 1
          return list
            .slice(0, boxBeingDraggedIndex)
            .concat(list.slice(boxBeingDraggedIndex! + 1))
        },
      ),
    )
  }

  render() {
    const {selectedNodeId, modifierInstantiationDescriptors} = this.props
    const {boxBeingDraggedIndex, modifiersStatus} = this.state
    const isABoxBeingDragged = boxBeingDraggedIndex != null
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
                {modifiersList.map((modifierId: string, index: number) => {
                  // @ts-ignore
                  const modifier = modifierInstantiationDescriptors.byId[
                    modifierId
                  ].modifierId
                    .split('/')
                    .slice(-1)
                    .concat('-', modifiersStatus[modifierId].status)

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
                  index={modifiersList.length}
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
})(ModifiersEditor)
