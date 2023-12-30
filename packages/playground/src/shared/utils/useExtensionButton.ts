import theatre from '@theatre/core'
import {useEffect, useMemo, useRef} from 'react'

let idCounter = 0

export function useExtensionButton(
  title: string,
  callback: () => void,
  svgSource: string = stepForward,
) {
  const refs = useRef({callback, svgSource})
  const id = useMemo(() => 'useExtensionButton#' + idCounter++, [])
  useEffect(() => {
    const studio = theatre.getStudioSync()!
    studio.extend({
      id: id,
      toolbars: {
        global(set) {
          set([
            {
              type: 'Icon',
              title,
              onClick() {
                refs.current.callback()
              },
              svgSource: refs.current.svgSource,
            },
          ])
          return () => {}
        },
      },
    })
  }, [id])
}

export function extensionButton(
  title: string,
  callback: () => void,
  svgSource?: string,
) {
  const id = 'useExtensionButton#' + idCounter++
  const studio = theatre.getStudioSync()!
  studio.extend({
    id: id,
    toolbars: {
      global(set) {
        set([
          {
            type: 'Icon',
            title,
            onClick() {
              callback()
            },
            svgSource: svgSource ?? stepForward,
          },
        ])
        return () => {}
      },
    },
  })
}

// FontAwesome FaStepForward
const stepForward = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M384 44v424c0 6.6-5.4 12-12 12h-48c-6.6 0-12-5.4-12-12V291.6l-195.5 181C95.9 489.7 64 475.4 64 448V64c0-27.4 31.9-41.7 52.5-24.6L312 219.3V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12z"></path></svg>`
