import type {VFC} from 'react'
import React from 'react'
import TransformControlsModeSelect from './TransformControlsModeSelect'
import {useEditorStore} from '../store'
import shallow from 'zustand/shallow'
import ReferenceWindow from './ReferenceWindow'
import {saveAs} from 'file-saver'
import TransformControlsSpaceSelect from './TransformControlsSpaceSelect'
import ViewportShadingSelect from './ViewportShadingSelect'
import {AiFillEye, GiPocketBow, RiFocus3Line} from 'react-icons/all'
import {Vector3} from 'three'
import {IconButton, Button, SettingsButton} from './elements'
import ViewportSettings from './ViewportSettings'
import type {$FixMe} from '@theatre/shared/utils/types'

const UI: VFC = () => {
  const [
    transformControlsMode,
    transformControlsSpace,
    viewportShading,
    referenceWindowSize,
    setTransformControlsMode,
    setTransformControlsSpace,
    setViewportShading,
    setEditorOpen,
    setEditableTransform,
  ] = useEditorStore(
    (state) => [
      state.transformControlsMode,
      state.transformControlsSpace,
      state.viewportShading,
      state.referenceWindowSize,
      state.setTransformControlsMode,
      state.setTransformControlsSpace,
      state.setViewportShading,
      state.setEditorOpen,
      state.setEditableTransform,
    ],
    shallow,
  )

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      <div className="flex h-full">
        <div className="relative flex-1 m-5">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="pointer-events-auto">
                <TransformControlsModeSelect
                  value={transformControlsMode}
                  onChange={(value) => setTransformControlsMode(value)}
                />
              </div>
              <div className="pointer-events-auto">
                <TransformControlsSpaceSelect
                  value={transformControlsSpace}
                  onChange={setTransformControlsSpace}
                />
              </div>
              <div className="pointer-events-auto">
                <ViewportShadingSelect
                  value={viewportShading}
                  onChange={setViewportShading}
                />
              </div>
              <div className="pointer-events-auto">
                <IconButton
                  label="Focus on selected"
                  icon={<RiFocus3Line />}
                  onClick={() => {
                    const orbitControls = useEditorStore.getState()
                      .orbitControlsRef?.current
                    const selected = useEditorStore.getState().selected
                    let focusObject

                    if (selected) {
                      focusObject = useEditorStore.getState()
                        .editablesSnapshot![selected].proxyObject
                    }

                    if (orbitControls && focusObject) {
                      focusObject.getWorldPosition(
                        // @ts-ignore TODO
                        orbitControls.target as Vector3,
                      )
                    }
                  }}
                />
              </div>
              <div className="pointer-events-auto">
                <IconButton
                  label="Align object to view"
                  icon={<GiPocketBow />}
                  onClick={() => {
                    const camera = (useEditorStore.getState().orbitControlsRef
                      ?.current as $FixMe)?.object
                    const selected = useEditorStore.getState().selected

                    let proxyObject

                    if (selected) {
                      proxyObject = useEditorStore.getState()
                        .editablesSnapshot![selected].proxyObject

                      if (proxyObject && camera) {
                        const direction = new Vector3()
                        const position = camera.position.clone()

                        camera.getWorldDirection(direction)
                        proxyObject.position.set(0, 0, 0)
                        proxyObject.lookAt(direction)

                        proxyObject.parent!.worldToLocal(position)
                        proxyObject.position.copy(position)

                        proxyObject.updateMatrix()

                        setEditableTransform(
                          selected,
                          proxyObject.matrix.clone(),
                        )
                      }
                    }
                  }}
                />
              </div>
              <div className="pointer-events-auto">
                <SettingsButton icon={<AiFillEye />} label="Viewport settings">
                  <ViewportSettings />
                </SettingsButton>
              </div>
            </div>
            <div className="absolute right-0 top-0 -z-10">
              <ReferenceWindow height={referenceWindowSize} />
            </div>
          </div>

          {/* Bottom-left corner*/}
          <Button
            className="absolute left-0 bottom-0 pointer-events-auto"
            onClick={() => setEditorOpen(false)}
          >
            Close
          </Button>

          {/* Bottom-right corner */}
          <Button
            className="absolute right-0 bottom-0 pointer-events-auto"
            onClick={() => {
              const blob = new Blob(
                [JSON.stringify(useEditorStore.getState().serialize())],
                {type: 'text/json;charset=utf-8'},
              )
              saveAs(blob, 'editableState.json')
            }}
          >
            Export
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UI
