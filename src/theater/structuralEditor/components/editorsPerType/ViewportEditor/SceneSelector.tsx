import resolveCss from '$shared/utils/resolveCss'
import PureComponentWithTheater from '$theater/componentModel/react/utils/PureComponentWithTheater'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React from 'react'
import * as css from './DimensionsEditor.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import PanelSection from '$theater/structuralEditor/components/reusables/PanelSection'
import {pathToViewport} from './DimensionsEditor'
import {get} from 'lodash'
import {IViewport} from '$theater/workspace/types'
import {getComponentDescriptor} from '$theater/componentModel/selectors'
import Theater from '$theater/bootstrap/Theater'
import {IComponentId} from '$theater/componentModel/types/index'
import {IComponentDescriptor} from '$theater/componentModel/types'
import {reduceHistoricState} from '$theater/bootstrap/actions'
import {makeSceneComponent} from '$theater/componentModel/utils'
import {batchedAction} from '$shared/utils/redux/withHistory/withBatchActions'

type IProps = {
  css?: Partial<typeof css>
  viewportId: string
}

interface IState {}

export default class SceneSelector extends PureComponentWithTheater<
  IProps,
  IState
> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  setSceneComponentId = (id: IComponentId) => {
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
      if (findSceneByDisplayName(newSceneName, this.theater)) {
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
      const possibleSceneId = findSceneByDisplayName(req, this.theater)
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
        {({props: propsP}) => {
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
    const viewportP = get(this.theaterAtom2P, path) as Pointer<IViewport>
    const sceneComponentId = val(viewportP.sceneComponentId)
    const sceneComponentP = getComponentDescriptor(
      this.theaterAtom2P,
      sceneComponentId,
    )
    const displayName = val(sceneComponentP.displayName)
    return displayName
  }
}

const findSceneByDisplayName = (
  displayName: string,
  theater: Theater,
): IComponentId | void => {
  const state = theater.atom2.getState()
  const lookIn = (
    descs: Record<IComponentId, IComponentDescriptor>,
  ): IComponentId | void => {
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
