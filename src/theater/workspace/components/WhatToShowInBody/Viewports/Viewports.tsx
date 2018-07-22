import React from 'react'
import {val} from '$shared/DataVerse2/atom'
import * as css from './Viewports.css'
import resolveCss from '$shared/utils/resolveCss'
import {map} from 'lodash'
import Viewport from './Viewport'
import {reduceHistoricState} from '$theater/bootstrap/actions'
import ActiveModeDetector, {
  ActiveMode,
} from '$theater/common/components/ActiveModeDetector/ActiveModeDetector'
import Container from '$theater/workspace/components/WhatToShowInBody/Viewports/Container'
import PureComponentWithTheater from '$theater/componentModel/react/utils/PureComponentWithTheater'
import PropsAsPointer from '$theater/handy/PropsAsPointer'

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
