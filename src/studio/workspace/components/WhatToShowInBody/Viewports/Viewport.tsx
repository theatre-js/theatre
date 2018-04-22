import React from 'react'
import ReactiveComponentWithStudio from '$studio/componentModel/react/utils/ReactiveComponentWithStudio'
import {val} from '$shared/DataVerse2/atom'
import * as css from './Viewport.css'
import resolveCss from '$shared/utils/resolveCss'
import dictAtom from '$shared/DataVerse/atoms/dictAtom'
import arrayAtom from '$shared/DataVerse/atoms/arrayAtom'
import elementify from '$studio/componentModel/react/elementify/elementify'
import constant from '$shared/DataVerse/derivations/constant'
import {reduceHistoricState} from '$studio/bootstrap/actions'
import Studio from '$studio/bootstrap/Studio'
import { getComponentDescriptor } from '$studio/componentModel/selectors';

const classes = resolveCss(css)

const viewportSym = Symbol('TheaterJS/ViewportElement')

interface IProps {
  /**
   * We don't expect the `id` prop to change
   */
  id: string
}

interface IState {}

export default class Viewport extends ReactiveComponentWithStudio<
  IProps,
  IState
> {
  static [viewportSym] = true
  volatileId: string
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.volatileId = this.studio.elementTree.mirrorOfReactTree.assignEarlyVolatileIdToComponentInstance(
      this,
    )

    this.studio.elementTree.registerUnexpandedViewport(
      props.id,
      this.volatileId,
    )
  }

  componentWillUnmount() {
    this.studio.elementTree.unregisterUnexpandedViewport(this.props.id)
  }

  _activate = () => {
    this.dispatch(
      reduceHistoricState(
        ['historicWorkspace', 'viewports', 'activeViewportId'],
        () => this.props.id,
      ),
    )
  }

  _render() {
    const viewportDescriptor = val(
      this.studioAtom2P.historicWorkspace.viewports.byId[this.props.id],
    )

    const activeViewportId = val(
      this.studioAtom2P.historicWorkspace.viewports.activeViewportId,
    )

    const isActive = activeViewportId === this.props.id

    const instantiationDescriptor = dictAtom({
      componentId: viewportDescriptor.sceneComponentId,
      props: dictAtom({}),
      modifierInstantiationDescriptors: dictAtom({
        byId: dictAtom({}),
        list: arrayAtom([]),
      }),
    })

    const elementD = elementify(
      constant(`SceneComponent`),
      instantiationDescriptor.derivedDict().pointer(),
      constant(this.studio),
    )

    return (
      <div
        {...classes('container', isActive && 'isActive')}
        style={{
          left: `${viewportDescriptor.position.x}px`,
          top: `${viewportDescriptor.position.y}px`,
          width: `${viewportDescriptor.dimensions.width}px`,
          height: `${viewportDescriptor.dimensions.height}px`,
        }}
      >
        <div key="content" {...classes('content')}>
          {elementD.getValue()}
        </div>
        <div {...classes('header')} onClick={this._activate}>
          <span {...classes('headerSceneName')}>
            {getDisplayNameOfComponent(
              this.studio,
              viewportDescriptor.sceneComponentId,
            )}
          </span>
          <span {...classes('headerSeperator')}>–</span>
          <span {...classes('headerDimensions')}>
            {viewportDescriptor.dimensions.width}x
            {viewportDescriptor.dimensions.height}
          </span>
        </div>
        {!isActive && (
          <div {...classes('unclickable')} onClick={this._activate} />
        )}
      </div>
    )
  }
}

export const isViewportElement = (n: $IntentionalAny): n is Viewport =>
  n && n.constructor && n.constructor[viewportSym] === true

const getDisplayNameOfComponent = (studio: Studio, id: string) => {
  const componentDescriptorP = getComponentDescriptor(studio.atom2.pointer, id)
  const displayName = val(componentDescriptorP.displayName)
  if (typeof displayName !== 'string') {
    throw new Error(`Got a non-string displayName. This should never happen`)
  }
  return displayName
}
