import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import type {ToolsetConfig} from '@theatre/studio'
import studio from '@theatre/studio'
import extension from '@theatre/r3f/dist/extension'
import {Box, prism, Ticker, val} from '@theatre/dataverse'

studio.extend(extension)
studio.extend({
  id: '@theatre/hello-world-extension',
  toolbars: {
    global(set, studio) {
      const exampleBox = new Box('mobile')
      return prism<ToolsetConfig>(() => [
        {
          type: 'Switch',
          value: val(exampleBox.derivation),
          onChange: (value) => exampleBox.set(value),
          options: [
            {
              value: 'mobile',
              label: 'view mobile version',
              svgSource: '😀',
            },
            {
              value: 'desktop',
              label: 'view desktop version',
              svgSource: '🪢',
            },
          ],
        },
        {
          type: 'Icon',
          title: 'Example Icon',
          svgSource: '👁‍🗨',
          onClick: () => {
            console.log('hello')
          },
        },
      ]).tapImmediate(Ticker.raf, (value) => {
        set(value)
      })
    },
  },
  panes: [],
})
studio.initialize()

ReactDOM.render(<App />, document.getElementById('root'))
