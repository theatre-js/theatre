import type {VFC} from 'react'
import React, {useEffect, useRef, Suspense} from 'react'
import {Canvas} from '@react-three/fiber'
import {useEditorStore} from '../store'
import {OrbitControls, Environment} from '@react-three/drei'
import shallow from 'zustand/shallow'
import root from 'react-shadow'
import styles from '../bundle.css.txt'
import UI from './UI'
import ProxyManager from './ProxyManager'
import {Button, Heading, Code, PortalManager, IdProvider} from './elements'
import studio from '@theatre/studio'

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
  const [
    sceneSnapshot,
    editorOpen,
    initialState,
    initialEditorCamera,
    setEditorOpen,
    createSnapshot,
  ] = useEditorStore(
    (state) => [
      state.sceneSnapshot,
      state.editorOpen,
      state.initialState,
      state.initialEditorCamera,
      state.setEditorOpen,
      state.createSnapshot,
    ],
    shallow,
  )

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
                ) : (
                  <div className="flex justify-center items-center bg-white h-screen">
                    <div className="flex flex-col gap-5 items-center ">
                      <Heading className="text-2xl mb-4">
                        No canvas connected
                      </Heading>
                      <div>
                        Please use <Code>configure()</Code> and{' '}
                        <Code>bind()</Code> to connect a canvas to React Three
                        Editable.
                      </div>
                      <Code block>
                        {`import React from 'react';
import { Canvas } from '@react-three/fiber';
import { configure, editable as e } from 'react-three-editable';

const bind = configure({
  localStorageNamespace: "MyProject"
});

const MyComponent = () => (
  <Canvas onCreated={bind()}>
    <e.mesh uniqueName="My First Editable Object">
      <sphereBufferGeometry />
      <meshStandardMaterial color="rebeccapurple" />
    </e.mesh>
  </Canvas>
);`}
                      </Code>
                      <div>
                        For more details, please consult the{' '}
                        <a
                          className="rounded-md font-medium text-green-600 hover:text-green-500"
                          href="https://github.com/AndrewPrifer/react-three-editable"
                          rel="noreferrer"
                          target="_blank"
                        >
                          documentation
                        </a>
                        .
                      </div>
                      <Button
                        className=""
                        onClick={() => {
                          setEditorOpen(false)
                        }}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {editorOpen || (
                <Button
                  className="fixed bottom-5 left-5"
                  onClick={() => {
                    if (!sceneSnapshot) {
                      createSnapshot()
                    }
                    setEditorOpen(true)
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
