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
interface IOwnProps {
  pathToComponentDescriptor: string[]
}

interface IProps extends IOwnProps {
  componentDescriptor: IDeclarativeComponentDescriptor
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
  modifierInstantiationDescriptors: $FixMe
  boxBeingDraggedIndex: null | number
  lastAction: LastAction
}

const modifierTypes = ['translate', 'rotate', 'scale', 'skew']
const modifierDirs = ['X', 'Y', 'Z']

class ModifiersEditor extends StudioComponent<IProps, IState> {
  state = {
    modifierInstantiationDescriptors: null,
    boxBeingDraggedIndex: null,
    lastAction: null,
  }

  componentDidMount() {
    this.setModifiers(this.props.componentDescriptor)
  }

  componentWillReceiveProps(nextProps: IProps) {
    this.setModifiers(nextProps.componentDescriptor)
  }

  private setModifiers = _.memoize((
    componentDescriptor: IDeclarativeComponentDescriptor,
  ) => {
    console.log('setting modifiers')
    let modifierInstantiationDescriptors: null | $FixMe = null
    const selectedNodeId = getSelectedNodeId(componentDescriptor)
    const possibleHiddenValue =
      selectedNodeId &&
      componentDescriptor.localHiddenValuesById[selectedNodeId]

    if (
      possibleHiddenValue &&
      // @ts-ignore
      possibleHiddenValue.__descriptorType &&
      // @ts-ignore
      possibleHiddenValue.__descriptorType ===
        'ComponentInstantiationValueDescriptor'
    ) {
      const instantiationValueDescriptor: IComponentInstantiationValueDescriptor = possibleHiddenValue as $IntentionalAny
      // const pathToLocalHiddenValueId = [
      //   ...pathToComponentDescriptor,
      //   'localHiddenValuesById',
      //   selectedNodeId,
      // ]

      // const pathToModifierInstantiationDescriptors = [
      //   ...pathToLocalHiddenValueId,
      //   'modifierInstantiationDescriptors',
      // ]
      // modifierInstantiationDescriptors =
      // instantiationValueDescriptor.modifierInstantiationDescriptors
      modifierInstantiationDescriptors = {
        list:
          instantiationValueDescriptor.modifierInstantiationDescriptors.list,
        byId: Object.entries(
          instantiationValueDescriptor.modifierInstantiationDescriptors.byId,
        ).reduce((reducer, [key, value]: [string, Object]) => {
          return (reducer = {
            ...reducer,
            [key]: {
              ...value,
              ...this.getComponentStatusAndActionPayload(key),
            },
          })
        }, {}),
      }
    }

    // if (
    //   // @ts-ignore
    //   possibleHiddenValue.__descriptorType ===
    //   'ComponentInstantiationValueDescriptor'
    // ) {

    // if (
    //   rootComponentDescriptor.whatToRender.__descriptorType ===
    //   DESCRIPTOR_TYPE.REF_TO_LOCAL_HIDDEN_VALUE
    // ) {
    //   const {localHiddenValuesById, whatToRender} = rootComponentDescriptor
    //   nodes = this._getComponentData(
    //     localHiddenValuesById[whatToRender.which],
    //     localHiddenValuesById,
    //   )
    // }
    // this._unsetLastAction()
    this.setState(() => ({
      lastAction: null,
      modifierInstantiationDescriptors,
    }))
  })

  private getComponentStatusAndActionPayload(
    id: string,
  ): {status: string; actionPayload: undefined | ActionPayload} {
    let status: string = STATUS_BY_ACTION.DEFAULT,
      actionPayload

    const {lastAction} = this.state
    if (lastAction != null) {
      const action = lastAction as Action
      const {id, ...payload} = action.payload
      status = STATUS_BY_ACTION[action.type]
      actionPayload = payload
    }
    return {status, actionPayload}
  }

  createBox = (index: number) => {
    console.log(this.props)
    this.setState(({modifierInstantiationDescriptors: {byId, list}}) => {
      const uniqueId = generateUniqueId()
      const newModifier = {
        modifierId: [
          modifierTypes[Math.floor(Math.random() * modifierTypes.length)],
          modifierDirs[Math.floor(Math.random() * modifierDirs.length)],
        ].join(''),
      }
      return {
        lastAction: {type: ACTION.BOX_ADD, payload: {id: uniqueId}},
        modifierInstantiationDescriptors: {
          list: list.slice(0, index).concat(uniqueId, list.slice(index)),
          byId: {...byId, [uniqueId]: newModifier},
        },
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
    let {modifierInstantiationDescriptors: {list: modifiersList}} = this.state
    const modifierToMove = modifiersList[boxBeingDraggedIndex]
    modifiersList = modifiersList
      .slice(0, index)
      .concat(modifierToMove)
      .concat(modifiersList.slice(index))
    if (boxBeingDraggedIndex > index) boxBeingDraggedIndex++
    modifiersList = modifiersList
      .slice(0, boxBeingDraggedIndex)
      .concat(modifiersList.slice(boxBeingDraggedIndex + 1))
    this.setState(({modifierInstantiationDescriptors}) => ({
      lastAction: {type: ACTION.BOX_MOVE, payload: {id: modifierToMove}},
      modifierInstantiationDescriptors: {
        ...modifierInstantiationDescriptors,
        list: modifiersList,
      },
    }))
  }

  render() {
    const {boxBeingDraggedIndex, modifierInstantiationDescriptors} = this.state
    const isABoxBeingDragged = boxBeingDraggedIndex != null
    const modifiersList =
      modifierInstantiationDescriptors != null
        ? modifierInstantiationDescriptors.list
        : []
    // console.log(modifierInstantiationDescriptors)
    return (
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
    )
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
  return {
    componentDescriptor: _.get(s, op.pathToComponentDescriptor),
  }
})(ModifiersEditor)
