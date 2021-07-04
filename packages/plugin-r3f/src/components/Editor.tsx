import type {VFC} from 'react'
import {useLayoutEffect} from 'react'
import React, {useEffect, useRef} from 'react'
import {Canvas} from '@react-three/fiber'
import {useEditorStore} from '../store'
import {OrbitControls} from '@react-three/drei'
import shallow from 'zustand/shallow'
import root from 'react-shadow'
import styles from '../bundle.css.txt'
import UI from './UI'
import ProxyManager from './ProxyManager'
import studio from '@theatre/studio'
import {useVal} from '@theatre/dataverse-react'

const EditorScene = () => {
  const orbitControlsRef = useRef<typeof OrbitControls>()

  const [editorObject, helpersRoot, setOrbitControlsRef] = useEditorStore(
    (state) => [
      state.editorObject,
      state.helpersRoot,
      state.setOrbitControlsRef,
    ],
    shallow,
  )

  const showGrid = useVal(editorObject?.props.showGrid) ?? true
  const showAxes = useVal(editorObject?.props.showAxes) ?? true

  useEffect(() => {
    setOrbitControlsRef(orbitControlsRef)
  }, [setOrbitControlsRef])

  return (
    <>
      {showGrid && <gridHelper args={[1000, 1000, 0x444444, 0x888888]} />}
      {showAxes && <axesHelper args={[500]} />}
      {/* @ts-ignore */}
      <OrbitControls ref={orbitControlsRef} />
      <primitive object={helpersRoot}></primitive>
      <ProxyManager orbitControlsRef={orbitControlsRef} />
    </>
  )
}

const Editor: VFC = () => {
  const [editorObject, sceneSnapshot, initialEditorCamera, createSnapshot] =
    useEditorStore(
      (state) => [
        state.editorObject,
        state.sceneSnapshot,
        state.initialEditorCamera,
        state.createSnapshot,
      ],
      shallow,
    )

  const editorOpen = useVal(editorObject?.props.isOpen)
  useLayoutEffect(() => {
    if (editorOpen) {
      createSnapshot()
    }
  }, [editorOpen])

  if (!editorObject) return <></>

  return (
    <root.div>
      <div id="react-three-editable-editor-root">
        <>
          <>
            <div className="relative z-50">
              <div
                className={`fixed ${editorOpen ? 'block' : 'hidden'} inset-0`}
              >
                {sceneSnapshot ? (
                  <>
                    <div className="relative z-0 h-full">
                      <Canvas
                        // @ts-ignore
                        colorManagement
                        camera={initialEditorCamera}
                        onCreated={({gl}) => {
                          gl.setClearColor('white')
                        }}
                        shadowMap
                        pixelRatio={window.devicePixelRatio}
                        onPointerMissed={() =>
                          studio.__experimental_setSelection([])
                        }
                      >
                        <EditorScene />
                      </Canvas>
                    </div>

                    <UI />
                  </>
                ) : null}
              </div>
            </div>

            <style type="text/css">{styles}</style>
          </>
        </>
      </div>
    </root.div>
  )
}

export default Editor
