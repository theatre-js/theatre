import React from 'react'
import ReactiveComponentWithTheater from '$theater/componentModel/react/utils/ReactiveComponentWithStudio'
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

const classes = resolveCss(css)

interface IProps {}

interface IState {}

export default class Viewports extends ReactiveComponentWithTheater<
  IProps,
  IState
> {
  _setNoViewportAsActive = () => {
    console.log('hi')

    this.dispatch(
      reduceHistoricState(
        ['historicWorkspace', 'viewports', 'activeViewportId'],
        () => undefined,
      ),
    )
  }

  _render() {
    // @todo use keys()
    const viewports = val(this.theaterAtom2P.historicWorkspace.viewports.byId)

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
  }
}
