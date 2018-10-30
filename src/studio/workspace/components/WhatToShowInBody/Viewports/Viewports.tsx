import React from 'react'
import {val} from '$shared/DataVerse2/atom'
import * as css from './Viewports.css'
import resolveCss from '$shared/utils/resolveCss'
import {map} from '$shared/utils'
import Viewport from './Viewport'
import {reduceHistoricState} from '$studio/bootstrap/actions'
import ActiveModeDetector, {
  ActiveMode,
} from '$studio/common/components/ActiveModeDetector/ActiveModeDetector'
import Container from '$studio/workspace/components/WhatToShowInBody/Viewports/Container'
import PureComponentWithTheater from '$studio/handy/PureComponentWithTheater'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'

const classes = resolveCss(css)

interface IProps {}

interface IState {}

export default class Viewports extends PureComponentWithTheater<
  IProps,
  IState
> {
  _setNoViewportAsActive = () => {
    this.dispatch(
      reduceHistoricState(
        ['historicWorkspace', 'viewports', 'activeViewportId'],
        () => undefined,
      ),
    )
  }

  render() {
    return (
      <PropsAsPointer props={this.props}>
        {() => {
          // @todo use keys()
          const viewports = val(
            this.theaterAtom2P.historicWorkspace.viewports.byId,
          )

          return (
            <ActiveModeDetector modes={['option', 'cmd']}>
              {(activeMode: ActiveMode) => {
                return (
                  <Container
                    initialState={val(
                      this.theaterAtom2P.ahistoricWorkspace.viewportsContainer,
                    )}
                    dispatch={this.dispatch}
                    activeMode={activeMode}
                    classes={classes('container')}
                  >
                    {(scrollX: number, scrollY: number) => {
                      return (
                        <>
                          <div
                            {...classes('viewports')}
                            style={{
                              left: scrollX,
                              top: scrollY,
                            }}
                          >
                            {map(viewports, s => {
                              return (
                                <Viewport
                                  key={s.id}
                                  id={s.id}
                                  activeMode={activeMode}
                                />
                              )
                            })}
                          </div>
                          <div
                            {...classes('background')}
                            onClick={this._setNoViewportAsActive}
                          />
                        </>
                      )
                    }}
                  </Container>
                )
              }}
            </ActiveModeDetector>
          )
        }}
      </PropsAsPointer>
    )
  }
}
