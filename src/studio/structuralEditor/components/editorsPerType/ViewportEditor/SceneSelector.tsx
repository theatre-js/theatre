import resolveCss from '$shared/utils/resolveCss'
import PureComponentWithStudio from '$studio/componentModel/react/utils/PureComponentWithStudio'
import PropsAsPointer from '$studio/handy/PropsAsPointer'
import React from 'react'
import * as css from './DimensionsEditor.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import PanelSection from '$src/studio/structuralEditor/components/reusables/PanelSection'
import {pathToViewport} from './DimensionsEditor'
import {get} from 'lodash'
import {IViewport} from '$studio/workspace/types'
import {getComponentDescriptor} from '$src/studio/componentModel/selectors'
import Studio from '$studio/bootstrap/Studio'
import {ComponentId} from '../../../../componentModel/types/index'
import {ComponentDescriptor} from '$studio/componentModel/types'
import {reduceHistoricState} from '$studio/bootstrap/actions'
import {makeSceneComponent} from '../../../../componentModel/utils'
import {batchedAction} from '$shared/utils/redux/withHistory/withBatchActions'

type IProps = {
  css?: Partial<typeof css>
  viewportId: string
}

interface IState {}

export default class SceneSelector extends PureComponentWithStudio<
  IProps,
  IState
> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  setSceneComponentId = (id: ComponentId) => {
    this.dispatch(
      reduceHistoricState(
        [
          'historicWorkspace',
          'viewports',
          'byId',
          this.props.viewportId,
          'sceneComponentId',
        ],
        () => id,
      ),
    )
  }

  promptSceneChange = () => {
    const currentDisplayName = this.getDisplayName(this.props.viewportId)
    const req = window.prompt(
      `Choose scene (write "new" to make a new scene`,
      currentDisplayName,
    )
    if (!req) {
      return
    } else if (req === 'new') {
      const newSceneName = window.prompt(
        `New scene's name (should end with word "Scene")`,
      )
      if (!newSceneName) return
      if (!newSceneName.endsWith('Scene')) {
        alert('Bad scene name')
        return
      }
      if (findSceneByDisplayName(newSceneName, this.studio)) {
        return alert(`A Scene with this name already exists`)
      }

      const componentDescriptor = makeSceneComponent({
        displayName: newSceneName,
      })
      this.dispatch(
        batchedAction([
          reduceHistoricState(
            [
              'historicComponentModel',
              'customComponentDescriptors',
              componentDescriptor.id,
            ],
            () => componentDescriptor,
          ),
          reduceHistoricState(
            [
              'historicWorkspace',
              'viewports',
              'byId',
              this.props.viewportId,
              'sceneComponentId',
            ],
            () => componentDescriptor.id,
          ),
        ]),
      )

      return
    } else {
      const possibleSceneId = findSceneByDisplayName(req, this.studio)
      if (possibleSceneId) {
        this.setSceneComponentId(possibleSceneId)
      } else {
        alert(`Can't find such a scene`)
      }
    }
  }

  render() {
    const {props} = this
    const classes = resolveCss(css, props.css)

    return (
      <PropsAsPointer props={props as IProps}>
        {(propsP: Pointer<IProps>) => {
          const viewportId = val(propsP.viewportId)

          const displayName = this.getDisplayName(viewportId)

          return (
            <PanelSection label="Scene">
              <div {...classes('container')} onClick={this.promptSceneChange}>
                {displayName}
              </div>
            </PanelSection>
          )
        }}
      </PropsAsPointer>
    )
  }

  private getDisplayName(viewportId: string) {
    const path = pathToViewport(viewportId)
    const viewportP = get(this.studioAtom2P, path) as Pointer<IViewport>
    const sceneComponentId = val(viewportP.sceneComponentId)
    const sceneComponentP = getComponentDescriptor(
      this.studioAtom2P,
      sceneComponentId,
    )
    const displayName = val(sceneComponentP.displayName)
    return displayName
  }
}

const findSceneByDisplayName = (
  displayName: string,
  studio: Studio,
): ComponentId | void => {
  const state = studio.atom2.getState()
  const lookIn = (
    descs: Record<ComponentId, ComponentDescriptor>,
  ): ComponentId | void => {
    for (const id in descs) {
      const desc = descs[id]
      if (desc.displayName === displayName) return desc.id
    }
  }

  return (
    lookIn(state.historicComponentModel.customComponentDescriptors) ||
    lookIn(state.historicComponentModel.customComponentDescriptors)
  )
}
