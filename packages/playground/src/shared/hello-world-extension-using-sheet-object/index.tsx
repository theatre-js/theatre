import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import type {ISheetObject} from '@theatre/core';
import { onChange, types, val} from '@theatre/core'
import studio from '@theatre/studio'
import extension from '@theatre/r3f/dist/extension'

const dataConfig = {
  exampleProp: types.stringLiteral('yes', {
    no: 'no',
    yes: 'yes',
  }),
}

studio.extend(extension)
studio.extend({
  id: '@theatre/hello-world-extension',
  toolbars: {
    global(set, studio) {
      // A sheet object used by this extension
      const obj: ISheetObject<typeof dataConfig> = studio
        .getStudioProject()
        .sheet('example extension UI')
        .object('editor', dataConfig)

      const updateToolset = () =>
        set([
          {
            type: 'Switch',
            value: val(obj.props.exampleProp),
            onChange: (value) =>
              studio.transaction(({set}) => set(obj.props.exampleProp, value)),
            options: [
              {
                value: 'no',
                label: 'say no',
                svgSource: '👎',
              },
              {
                value: 'yes',
                label: 'say yes',
                svgSource: '👍',
              },
            ],
          },
        ])

      const untapFn = onChange(obj.props.exampleProp, () => {
        updateToolset()
      })

      // initial update
      updateToolset()

      return untapFn
    },
  },
  panes: [],
})
studio.initialize()

ReactDOM.render(<App />, document.getElementById('root'))
