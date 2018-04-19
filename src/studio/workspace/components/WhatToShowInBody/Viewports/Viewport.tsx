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

const classes = resolveCss(css)

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
  volatileId: string;
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.volatileId = this.studio.elementTree.mirrorOfReactTree.assignEarlyVolatileIdToComponentInstance(
      this,
    )

    this.studio.elementTree.registerUnexpandedViewport(props.id, this.volatileId)
  }

  componentWillUnmount() {
    this.studio.elementTree.unregisterUnexpandedViewport(props.id, this.volatileId)
  }

  _activate = () => {
    this.dispatch(
      reduceHistoricState(
        ['workspace', 'viewports', 'activeViewportId'],
        () => this.props.id,
      ),
    )
  }

  _render() {
    const viewportDescriptor = val(
      this.studioAtom2P.workspace.viewports.byId[this.props.id],
    )

    const activeViewportId = val(
      this.studioAtom2P.workspace.viewports.activeViewportId,
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
        {!isActive && (
          <div {...classes('unclickable')} onClick={this._activate} />
        )}
      </div>
    )
  }
}
