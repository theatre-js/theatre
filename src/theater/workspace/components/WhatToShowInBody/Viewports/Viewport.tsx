import React from 'react'
import ReactiveComponentWithTheater from '$theater/componentModel/react/utils/ReactiveComponentWithStudio'
import {val} from '$shared/DataVerse2/atom'
import * as css from './Viewport.css'
import resolveCss from '$shared/utils/resolveCss'
import dictAtom from '$shared/DataVerse/atoms/dictAtom'
import arrayAtom from '$shared/DataVerse/atoms/arrayAtom'
import elementify from '$theater/componentModel/react/elementify/elementify'
import constant from '$shared/DataVerse/derivations/constant'
import Theater from '$theater/bootstrap/Theater'
import {reduceHistoricState} from '$studio/bootstrap/actions'
import Studio from '$studio/bootstrap/Studio'
import {getComponentDescriptor} from '$studio/componentModel/selectors'
import EditOverlay, {
  SizeChanges,
} from '$studio/workspace/components/Panel/EditOverlay'
import {IViewport} from '$studio/workspace/types'
import {
  MODES,
  ActiveMode,
} from '$studio/common/components/ActiveModeDetector/ActiveModeDetector'

const classes = resolveCss(css)

const viewportSym = Symbol('TheaterJS/ViewportElement')

interface IProps {
  /**
   * We don't expect the `id` prop to change
   */
  id: string
  activeMode: ActiveMode
}

interface IState {
  positionChange: {x: number; y: number}
  dimensionsChange: {width: number; height: number}
}

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

  _getInitialState(): IState {
    return {
      positionChange: {x: 0, y: 0},
      dimensionsChange: {width: 0, height: 0},
    }
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

  moveViewport = (dx: number, dy: number) => {
    this.setState(() => ({
      positionChange: {x: dx, y: dy},
    }))
  }

  saveViewportPosition = () => {
    const positionChange = val(this.stateP.positionChange)
    const {id} = this.props
    this.setState(() => ({
      positionChange: {x: 0, y: 0},
    }))
    this.dispatch(
      reduceHistoricState(
        ['historicWorkspace', 'viewports', 'byId', id],
        (viewport: IViewport) => {
          return {
            ...viewport,
            position: {
              x: viewport.position.x + positionChange.x,
              y: viewport.position.y + positionChange.y,
            },
          }
        },
      ),
    )
  }

  resizeViewport = (changes: SizeChanges) => {
    const left = changes.left ? changes.left : 0
    const right = changes.right ? changes.right : 0
    const top = changes.top ? changes.top : 0
    const bottom = changes.bottom ? changes.bottom : 0
    this.setState(() => ({
      positionChange: {
        x: left,
        y: top,
      },
      dimensionsChange: {
        width: right - left,
        height: bottom - top,
      },
    }))
  }

  saveViewportSize = () => {
    const {positionChange, dimensionsChange} = val(this.stateP)
    const {id} = this.props
    this.setState(() => ({
      positionChange: {x: 0, y: 0},
      dimensionsChange: {width: 0, height: 0},
    }))
    this.dispatch(
      reduceHistoricState(
        ['historicWorkspace', 'viewports', 'byId', id],
        (viewport: IViewport) => {
          return {
            ...viewport,
            position: {
              x: viewport.position.x + positionChange.x,
              y: viewport.position.y + positionChange.y,
            },
            dimensions: {
              width: viewport.dimensions.width + dimensionsChange.width,
              height: viewport.dimensions.height + dimensionsChange.height,
            },
          }
        },
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

    const state = val(this.stateP)
    const left = viewportDescriptor.position.x + state.positionChange.x
    const top = viewportDescriptor.position.y + state.positionChange.y
    const width =
      viewportDescriptor.dimensions.width + state.dimensionsChange.width
    const height =
      viewportDescriptor.dimensions.height + state.dimensionsChange.height

    return (
      <div
        {...classes('container', isActive && 'isActive')}
        style={{
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <div key="content" {...classes('content')}>
          {elementD.getValue()}
        </div>
        {val(this.propsP.activeMode) === MODES.option && (
          <EditOverlay
            onMove={this.moveViewport}
            onMoveEnd={this.saveViewportPosition}
            onResize={this.resizeViewport}
            onResizeEnd={this.saveViewportSize}
          />
        )}
        <div {...classes('header')} onClick={this._activate}>
          <span {...classes('headerSceneName')}>
            {getDisplayNameOfComponent(
              this.theater,
              viewportDescriptor.sceneComponentId,
            )}
          </span>
          <span {...classes('headerSeperator')}>–</span>
          <span {...classes('headerDimensions')}>
            {width}x{height}
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
