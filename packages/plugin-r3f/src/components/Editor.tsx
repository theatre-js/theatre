import type {VFC} from 'react'
import {useLayoutEffect} from 'react'
import React, {useEffect, useRef, Suspense} from 'react'
import {Canvas} from '@react-three/fiber'
import {useEditorStore} from '../store'
import {OrbitControls, Environment} from '@react-three/drei'
import shallow from 'zustand/shallow'
import root from 'react-shadow'
import styles from '../bundle.css.txt'
import UI from './UI'
import ProxyManager from './ProxyManager'
import {Button, PortalManager, IdProvider} from './elements'
import studio from '@theatre/studio'
import {useVal} from '@theatre/dataverse-react'

const EditorScene = () => {
  const orbitControlsRef = useRef<typeof OrbitControls>()

  const [
    selectedHdr,
    useHdrAsBackground,
    showGrid,
    showAxes,
    helpersRoot,
    setOrbitControlsRef,
  ] = useEditorStore(
    (state) => [
      state.selectedHdr,
      state.useHdrAsBackground,
      state.showGrid,
      state.showAxes,
      state.helpersRoot,
      state.setOrbitControlsRef,
    ],
    shallow,
  )

  useEffect(() => {
    setOrbitControlsRef(orbitControlsRef)
  }, [setOrbitControlsRef])

  return (
    <>
      <Suspense fallback={null}>
        {selectedHdr && (
          <Environment
            // @ts-ignore
            files={selectedHdr}
            path=""
            background={useHdrAsBackground}
          />
        )}
      </Suspense>
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

  const editorOpen = !!useVal(editorObject?.props._isOpen)
  useLayoutEffect(() => {
    if (editorOpen) {
      createSnapshot()
    }
  }, [editorOpen])

  if (!editorObject) return <></>

  return (
    <root.div>
      <div id="react-three-editable-editor-root">
        <PortalManager>
          <IdProvider>
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
              {editorOpen || (
                <Button
                  className="fixed bottom-5 left-5"
                  onClick={() => {
                    studio.transaction(({set}) => {
                      set(editorObject.props._isOpen, 1)
                    })
                  }}
                >
                  Editor
                </Button>
              )}
            </div>

            <style type="text/css">{styles}</style>
          </IdProvider>
        </PortalManager>
      </div>
    </root.div>
  )
}

export default Editor
