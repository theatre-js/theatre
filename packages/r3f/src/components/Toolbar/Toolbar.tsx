import type {VFC} from 'react'
import React from 'react'
import {IoCameraOutline} from 'react-icons/io5'
import studio, {ToolbarIconButton} from '@theatre/studio'
import {useVal} from '@theatre/react'
import TransformControlsModeSelect from './TransformControlsModeSelect'
import ViewportShadingSelect from './ViewportShadingSelect'
import TransformControlsSpaceSelect from './TransformControlsSpaceSelect'
import {getEditorSheetObject} from '../editorStuff'

const Toolbar: VFC = () => {
  const editorObject = getEditorSheetObject()

  const transformControlsMode =
    useVal(editorObject?.props.transformControls.mode) ?? 'translate'
  const transformControlsSpace =
    useVal(editorObject?.props.transformControls.space) ?? 'world'
  const viewportShading =
    useVal(editorObject?.props.viewport.shading) ?? 'rendered'

  if (!editorObject) return <></>

  return (
    <>
      <ToolbarIconButton
        onClick={() => {
          studio.createPane('snapshot')
        }}
        title="Create snapshot"
      >
        <IoCameraOutline />
      </ToolbarIconButton>
      <TransformControlsModeSelect
        value={transformControlsMode}
        onChange={(value) =>
          studio.transaction(({set}) =>
            set(editorObject!.props.transformControls.mode, value),
          )
        }
      />
      <TransformControlsSpaceSelect
        value={transformControlsSpace}
        onChange={(space) => {
          studio.transaction(({set}) => {
            set(editorObject.props.transformControls.space, space)
          })
        }}
      />
      <ViewportShadingSelect
        value={viewportShading}
        onChange={(shading) => {
          studio.transaction(({set}) => {
            set(editorObject.props.viewport.shading, shading)
          })
        }}
      />

      {/* <ToolbarIconButton
        label="Focus on selected"
        icon={<RiFocus3Line />}
        onClick={() => {
          const orbitControls =
            useEditorStore.getState().orbitControlsRef?.current
          const selected = getSelected()

          let focusObject

          if (selected) {
            focusObject =
              useEditorStore.getState().editablesSnapshot![selected].proxyObject
          }

          if (orbitControls && focusObject) {
            focusObject.getWorldPosition(
              // @ts-ignore TODO
              orbitControls.target as Vector3,
            )
          }
        }}
      /> */}

      {/* <ToolbarIconButton
        label="Align object to view"
        icon={<GiPocketBow />}
        onClick={() => {
          const camera = (
            useEditorStore.getState().orbitControlsRef?.current as $FixMe
          )?.object

          const selected = getSelected()

          let proxyObject

          if (selected) {
            proxyObject =
              useEditorStore.getState().editablesSnapshot![selected].proxyObject

            if (proxyObject && camera) {
              const direction = new Vector3()
              const position = camera.position.clone()

              camera.getWorldDirection(direction)
              proxyObject.position.set(0, 0, 0)
              proxyObject.lookAt(direction)

              proxyObject.parent!.worldToLocal(position)
              proxyObject.position.copy(position)

              proxyObject.updateMatrix()
            }
          }
        }}
      /> */}
    </>
  )
}

export default Toolbar
