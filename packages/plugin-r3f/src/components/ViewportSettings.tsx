import type {VFC} from 'react'
import React from 'react'
import {useEditorStore} from '../store'
import shallow from 'zustand/shallow'
import {Checkbox, FormControl, Slider} from './elements'
import UnstyledFormLabel from './elements/UnstyledFormLabel'

const ViewportShadingSettings: VFC = () => {
  const [
    showOverlayIcons,
    showGrid,
    showAxes,
    referenceWindowSize,
    setShowOverlayIcons,
    setShowGrid,
    setShowAxes,
    setReferenceWindowSize,
  ] = useEditorStore(
    (state) => [
      state.showOverlayIcons,
      state.showGrid,
      state.showAxes,
      state.referenceWindowSize,
      state.setShowOverlayIcons,
      state.setShowGrid,
      state.setShowAxes,
      state.setReferenceWindowSize,
    ],
    shallow,
  )

  return (
    <div className="flex flex-col gap-3">
      <FormControl>
        <Checkbox
          // @ts-ignore
          checked={showOverlayIcons}
          onChange={() => setShowOverlayIcons(!showOverlayIcons)}
        >
          Show overlay icons
        </Checkbox>
      </FormControl>
      <FormControl>
        <Checkbox
          // @ts-ignore
          checked={showGrid}
          onChange={() => setShowGrid(!showGrid)}
        >
          Show grid
        </Checkbox>
      </FormControl>
      <FormControl>
        <Checkbox
          // @ts-ignore
          checked={showAxes}
          onChange={() => setShowAxes(!showAxes)}
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
