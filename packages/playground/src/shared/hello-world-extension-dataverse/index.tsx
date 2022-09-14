import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import type {ToolsetConfig} from '@theatre/studio'
import studio from '@theatre/studio'
import extension from '@theatre/r3f/dist/extension'
import {Box, prism, Ticker, val} from '@theatre/dataverse'

/**
 * Let's take a look at how we can use `prism`, `Ticker`, and `val` from Theatre.js's Dataverse library
 * to create a switch with state that is updated automatically,
 * and is even stored in a Theatre.js object.
 *
 * Without going into the details of `prism`, `Ticker`, and `val`, note that by wrapping our `ToolsetConfig` in a prism, our
 * ```ts
 * ... .tapImmediate(Ticker.raf, (toolset) => {
 *       set(toolset)
 *     })
 * ```
 * code will be called whenever `val(obj.props.exampleProp)` changes (whenever the user clicks the switch and the `onChange` callback is called).
 * This will ensure that our switch's value matches its state and is reflected in the UI via `set(toolset)`.
 */

studio.extend(extension)
studio.extend({
  id: '@theatre/hello-world-extension',
  toolbars: {
    global(set, studio) {
      const exampleBox = new Box('mobile')

      const untapFn = prism<ToolsetConfig>(() => [
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
      ])
        // listen to changes to this derivation using the requestAnimationFrame shared ticker
        .tapImmediate(Ticker.raf, (value) => {
          set(value)
        })

      return untapFn
    },
  },
  panes: [],
})
studio.initialize()

ReactDOM.render(<App />, document.getElementById('root'))
