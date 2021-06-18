import type {VFC} from 'react'
import React from 'react'
import {useEditorStore} from '../store'
import shallow from 'zustand/shallow'
import EnvironmentPreview from './EnvironmentPreview'
import {Checkbox, FormControl, Heading} from './elements'

const ViewportShadingSettings: VFC = () => {
  const [
    hdrPaths,
    selectedHdr,
    useHdrAsBackground,
    setSelectedHdr,
    setUseHdrAsBackground,
  ] = useEditorStore(
    (state) => [
      state.hdrPaths,
      state.selectedHdr,
      state.useHdrAsBackground,
      state.setSelectedHdr,
      state.setUseHdrAsBackground,
    ],
    shallow,
  )

  return (
    <div className="w-full">
      <Heading className="text-xl mb-3">Environment</Heading>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-4 auto-rows-16">
          <EnvironmentPreview
            url={null}
            selected={selectedHdr === null}
            onClick={() => {
              setSelectedHdr(null)
            }}
          />
          {hdrPaths.map((hdrPath) => (
            <EnvironmentPreview
              key={hdrPath}
              url={hdrPath}
              selected={hdrPath === selectedHdr}
              onClick={() => {
                setSelectedHdr(hdrPath)
              }}
            />
          ))}
        </div>
        <FormControl>
          <Checkbox
            checked={useHdrAsBackground}
            onChange={() => setUseHdrAsBackground(!useHdrAsBackground)}
          >
            Use as background
          </Checkbox>
        </FormControl>
      </div>
    </div>
  )
}

export default ViewportShadingSettings
