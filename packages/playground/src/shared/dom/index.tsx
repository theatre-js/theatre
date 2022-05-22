import ReactDOM from 'react-dom'
import studio from '@theatre/studio'
import {getProject} from '@theatre/core'
import {Scene} from './Scene'
import {TheatreLoggerLevel} from '@theatre/shared/logger'
import type {LoggerIncludePersistedState} from './LoggerIncludesMenu'
import {
  createLoggerIncludeState,
  LoggerIncludesMenu,
} from './LoggerIncludesMenu'
import {keyStorage} from './keyStorage'
import {RAFTicker} from './RAFTicker'
import React from 'react'
/**
 * This is a basic example of using Theatre for manipulating the DOM.
 *
 * It also uses {@link IStudio.selection | studio.selection} to customize
 * the selection behavior.
 */

studio.initialize()

const persisted = keyStorage(
  localStorage,
  'dom.loggerState',
  (prev) => prev as LoggerIncludePersistedState,
)

const ticker = RAFTicker.DEFAULT

const loggerState = createLoggerIncludeState(ticker, persisted.getItem())
loggerState.stateD.changes(ticker).tap((a) => persisted.setItem(a))

ReactDOM.render(
  <Scene
    project={getProject('Sample project', {
      experiments: {
        logging: {
          internal: true,
          dev: true,
          min: TheatreLoggerLevel.WARN,
          include: loggerState.includeFn,
        },
      },
    })}
  />,
  document.getElementById('root'),
)

ReactDOM.render(
  <LoggerIncludesMenu state={loggerState} />,
  document.getElementById('root'),
)
