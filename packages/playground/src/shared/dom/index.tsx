import React from 'react'
import ReactDOM from 'react-dom'
import {getProject} from '@theatre/core'
import {Scene} from './Scene'
import {LazyLoadStudio} from '../../common/LazyLoadStudio'

ReactDOM.render(
  <>
    <Scene
      project={getProject('Sample project', {
        // experiments: {
        //   logging: {
        //     internal: true,
        //     dev: true,
        //     min: TheatreLoggerLevel.TRACE,
        //   },
        // },
      })}
    />
    <LazyLoadStudio
      import={() =>
        import('@theatre/studio').then((mod) => ({
          loadStudio() {
            mod.default.initialize()
          },
        }))
      }
    />
  </>,
  document.getElementById('root'),
)
