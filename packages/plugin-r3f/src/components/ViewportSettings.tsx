import type {VFC} from 'react'
import React from 'react'
import {useEditorStore} from '../store'
import shallow from 'zustand/shallow'
import {Checkbox, FormControl, Slider} from './elements'
import UnstyledFormLabel from './elements/UnstyledFormLabel'
import {useVal} from '@theatre/dataverse-react'
import studio from '@theatre/studio'

const ViewportShadingSettings: VFC = () => {
  const [editorObject, referenceWindowSize, setReferenceWindowSize] =
    useEditorStore(
      (state) => [
        state.editorObject,
        state.referenceWindowSize,
        state.setReferenceWindowSize,
      ],
      shallow,
    )

  const showAxes = useVal(editorObject?.props.showAxes) ?? true
  const showGrid = useVal(editorObject?.props.showGrid) ?? true
  const showOverlayIcons = useVal(editorObject?.props.showOverlayIcons) ?? false

  return (
    <div className="flex flex-col gap-3">
      <FormControl>
        <Checkbox
          // @ts-ignore
          checked={showOverlayIcons}
          onChange={() =>
            studio.transaction(({set}) => {
              set(editorObject!.props.showOverlayIcons, !showOverlayIcons)
            })
          }
        >
          Show overlay icons
        </Checkbox>
      </FormControl>
      <FormControl>
        <Checkbox
          // @ts-ignore
          checked={showGrid}
          onChange={() =>
            studio.transaction(({set}) => {
              set(editorObject!.props.showGrid, !showGrid)
            })
          }
        >
          Show grid
        </Checkbox>
      </FormControl>
      <FormControl>
        <Checkbox
          // @ts-ignore
          checked={showAxes}
          onChange={() =>
            studio.transaction(({set}) => {
              set(editorObject!.props.showAxes, !showAxes)
            })
          }
        >
          Show axes
        </Checkbox>
      </FormControl>
      <FormControl>
        <div className="flex items-start">
          <div className="text-sm">
            <UnstyledFormLabel className="font-medium text-gray-700">
              Preview size:
            </UnstyledFormLabel>
          </div>
          <div className="ml-3 flex items-center h-5">
            <Slider
              value={referenceWindowSize}
              min={120}
              max={400}
              onChange={(event) =>
                setReferenceWindowSize(Number(event.target.value))
              }
            />
          </div>
        </div>
      </FormControl>
    </div>
  )
}

export default ViewportShadingSettings
