import React from 'react'
import ReactiveComponentWithTheater from '$theater/componentModel/react/utils/ReactiveComponentWithStudio'
import {val} from '$shared/DataVerse2/atom'
import * as css from './Viewport.css'
import resolveCss from '$shared/utils/resolveCss'
import dictAtom from '$shared/DataVerse/atoms/dictAtom'
import arrayAtom from '$shared/DataVerse/atoms/arrayAtom'
import elementify from '$theater/componentModel/react/elementify/elementify'
import constant from '$shared/DataVerse/derivations/constant'
import {reduceHistoricState} from '$theater/bootstrap/actions'
import {getComponentDescriptor} from '$theater/componentModel/selectors'
import Theater from '$theater/bootstrap/Theater'

const classes = resolveCss(css)

const viewportSym = Symbol('TheaterJS/ViewportElement')

interface IProps {
  /**
   * We don't expect the `id` prop to change
   */
  id: string
}

interface IState {}

export default class Viewport extends ReactiveComponentWithTheater<
  IProps,
  IState
> {
  static [viewportSym] = true
  volatileId: string
  viewportId: string
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.volatileId = this.theater.studio.elementTree.mirrorOfReactTree.assignEarlyVolatileIdToComponentInstance(
      this,
    )

    this.viewportId = props.id
    this.theater.studio.elementTree.registerUnexpandedViewport(
      props.id,
      this.volatileId,
    )
  }

  componentWillUnmount() {
    this.theater.studio.elementTree.unregisterUnexpandedViewport(this.props.id)
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
      this.theaterAtom2P.historicWorkspace.viewports.byId[this.props.id],
    )

    const activeViewportId = val(
      this.theaterAtom2P.historicWorkspace.viewports.activeViewportId,
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
      constant(this.theater),
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
              this.theater,
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

export const isViewportNode = (n: $IntentionalAny): n is Viewport =>
  n && n.constructor && n.constructor[viewportSym] === true

const getDisplayNameOfComponent = (theater: Theater, id: string) => {
  const componentDescriptorP = getComponentDescriptor(theater.atom2.pointer, id)
  const displayName = val(componentDescriptorP.displayName)
  if (typeof displayName !== 'string') {
    throw new Error(`Got a non-string displayName. This should never happen`)
  }
  return displayName
}
