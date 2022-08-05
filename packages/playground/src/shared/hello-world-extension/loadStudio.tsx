import studio from '@theatre/studio'
import extension from '@theatre/r3f/dist/extension'

export function loadStudio() {
  studio.extend(extension)
  studio.extend({
    id: '@theatre/hello-world-extension',
    toolbars: {
      global(set, studio) {
        let switchValue = 'mobile'
        const updateToolset = () =>
          set([
            {
              type: 'Switch',
              value: switchValue,
              onChange: (value) => {
                switchValue = value
                updateToolset()
              },
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
                studio.createPane('example')
              },
            },
          ])

        updateToolset()

        return () => {
          // remove any listeners if necessary when the extension is unloaded
        }
      },
    },
    panes: [
      {
        class: 'example',
        mount: ({paneId, node}) => {
          studio.ui.renderToolset('global', node)

          return () => {}
        },
      },
    ],
  })
  studio.initialize()
}
