import React from 'react'
import {val} from '$shared/DataVerse2/atom'
import * as css from './Viewport.css'
import resolveCss from '$shared/utils/resolveCss'
import dictAtom from '$shared/DataVerse/atoms/dictAtom'
import arrayAtom from '$shared/DataVerse/atoms/arrayAtom'
import elementify from '$studio/componentModel/react/elementify/elementify'
import constant from '$shared/DataVerse/derivations/constant'
import Theater from '$studio/bootstrap/Theater'
import {reduceHistoricState} from '$studio/bootstrap/actions'
import {getComponentDescriptor} from '$studio/componentModel/selectors'
import EditOverlay, {
  SizeChanges,
} from '$studio/workspace/components/Panel/EditOverlay'
import {IViewport} from '$studio/workspace/types'
import {
  MODES,
  ActiveMode,
} from '$studio/common/components/ActiveModeDetector/ActiveModeDetector'
import {TBoundingRect} from '$studio/workspace/components/WhatToShowInBody/Viewports/ViewportInstantiator'
import Header from '$studio/workspace/components/WhatToShowInBody/Viewports/Header'
import {batchedAction} from '$shared/utils/redux/withHistory/withBatchActions'
import PureComponentWithTheater from '$studio/handy/PureComponentWithTheater'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'

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
  positionChange: IViewport['position']
  dimensionsChange: IViewport['dimensions']
}

export default class Viewport extends PureComponentWithTheater<IProps, IState> {
  static [viewportSym] = true
  volatileId: string
  viewportId: string
  state = {
    positionChange: {x: 0, y: 0},
    dimensionsChange: {width: 0, height: 0},
  }
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.volatileId = this.studio.studio.elementTree.mirrorOfReactTree.assignEarlyVolatileIdToComponentInstance(
      this,
    )

    this.viewportId = props.id
    this.studio.studio.elementTree.registerUnexpandedViewport(
      props.id,
      this.volatileId,
    )
  }

  componentWillUnmount() {
    this.studio.studio.elementTree.unregisterUnexpandedViewport(this.props.id)
  }

  _activate = () => {
    this.dispatch(
      reduceHistoricState(
        ['historicWorkspace', 'viewports', 'activeViewportId'],
        () => this.props.id,
      ),
    )
  }

  deleteViewport = (id: string) => {
    this.dispatch(
      batchedAction([
        reduceHistoricState(
          ['historicWorkspace', 'viewports', 'activeViewportId'],
          activeViewportId =>
            activeViewportId === id ? undefined : activeViewportId,
        ),
        reduceHistoricState(
          ['historicWorkspace', 'viewports', 'byId'],
          ({[id]: _, ...viewports}) => viewports,
        ),
      ]),
    )
  }

  moveViewport = (dx: number, dy: number) => {
    this.setState(() => ({
      positionChange: {x: dx, y: dy},
    }))
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

  saveViewportSizeAndPosition = (viewportDescriptor: IViewport) => {
    const boundingRect = getBoundingRect(
      viewportDescriptor.position,
      viewportDescriptor.dimensions,
      this.state.positionChange,
      this.state.dimensionsChange,
    )

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
              x: boundingRect.left,
              y: boundingRect.top,
            },
            dimensions: {
              width: boundingRect.width,
              height: boundingRect.height,
            },
          }
        },
      ),
    )
  }

  render() {
    return (
      <PropsAsPointer props={this.props} state={this.state}>
        {({props, state}) => {
          const viewportDescriptor = val(
            this.studioAtom2P.historicWorkspace.viewports.byId[this.props.id],
          )

          if (viewportDescriptor == null) return null

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

          const boundingRect = getBoundingRect(
            viewportDescriptor.position,
            viewportDescriptor.dimensions,
            val(state.positionChange),
            val(state.dimensionsChange),
          )

          return (
            <div
              {...classes('container', isActive && 'isActive')}
              style={boundingRect}
            >
              <div key="content" {...classes('content')}>
                {elementD.getValue()}
              </div>
              {val(props.activeMode) === MODES.option && (
                <EditOverlay
                  onMove={this.moveViewport}
                  onMoveEnd={() =>
                    this.saveViewportSizeAndPosition(viewportDescriptor)
                  }
                  onResize={this.resizeViewport}
                  onResizeEnd={() =>
                    this.saveViewportSizeAndPosition(viewportDescriptor)
                  }
                />
              )}
              <Header
                isActive={isActive}
                viewportId={this.props.id}
                name={getDisplayNameOfComponent(
                  this.studio,
                  viewportDescriptor.sceneComponentId,
                )}
                width={boundingRect.width}
                height={boundingRect.height}
                activateViewport={this._activate}
                deleteViewport={this.deleteViewport}
              />
              {!isActive && (
                <div {...classes('unclickable')} onClick={this._activate} />
              )}
            </div>
          )
        }}
      </PropsAsPointer>
    )
  }
}

export const isViewportNode = (n: $IntentionalAny): n is Viewport =>
  n && n.constructor && n.constructor[viewportSym] === true

const getDisplayNameOfComponent = (studio: Theater, id: string) => {
  const componentDescriptorP = getComponentDescriptor(studio.atom2.pointer, id)
  const displayName = val(componentDescriptorP.displayName)
  if (typeof displayName !== 'string') {
    throw new Error(`Got a non-string displayName. This should never happen`)
  }
  return displayName
}

function getBoundingRect(
  viewportPosition: IViewport['position'],
  viewportDimensions: IViewport['dimensions'],
  positionChange: IViewport['position'],
  dimensionsChange: IViewport['dimensions'],
): TBoundingRect {
  const {x, y} = viewportPosition
  const {width, height} = viewportDimensions

  // const {positionChange, dimensionsChange} = val(this.stateP)

  const newLeft = x + positionChange.x
  const newTop = y + positionChange.y
  const newWidth = width + dimensionsChange.width
  const newHeight = height + dimensionsChange.height

  return {
    left: newWidth >= 0 ? newLeft : newLeft + newWidth,
    top: newHeight >= 0 ? newTop : newTop + newHeight,
    width: Math.abs(newWidth),
    height: Math.abs(newHeight),
  }
}
