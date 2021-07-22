import {useState} from 'react'
import {useLayoutEffect} from 'react'
import React, {useEffect, useRef} from 'react'
import {Canvas} from '@react-three/fiber'
import {useEditorStore} from '../store'
import {OrbitControls} from '@react-three/drei'
import shallow from 'zustand/shallow'
import root from 'react-shadow/styled-components'
import ProxyManager from './ProxyManager'
import studio, {ToolbarIconButton} from '@theatre/studio'
import {useVal} from '@theatre/dataverse-react'
import styled, {createGlobalStyle, StyleSheetManager} from 'styled-components'
import {IoCameraReverseOutline} from 'react-icons/all'

const GlobalStyle = createGlobalStyle`
  :host {
    contain: strict;
    all: initial;
    color: white;
    font: 11px -apple-system, BlinkMacSystemFont, Segoe WPC, Segoe Editor,
      HelveticaNeue-Light, Ubuntu, Droid Sans, sans-serif;
  }

  * {
    padding: 0;
    margin: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
    list-style: none;
  }
`

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

  const showGrid = useVal(editorObject?.props.viewport.showGrid) ?? true
  const showAxes = useVal(editorObject?.props.viewport.showAxes) ?? true

  useEffect(() => {
    setOrbitControlsRef(orbitControlsRef)
  }, [setOrbitControlsRef])

  return (
    <>
      {showGrid && <gridHelper args={[20, 20, '#6e6e6e', '#4a4b4b']} />}
      {showAxes && <axesHelper args={[500]} />}
      {/* @ts-ignore */}
      <OrbitControls ref={orbitControlsRef} enableDamping={false} />
      <primitive object={helpersRoot}></primitive>
      <ProxyManager orbitControlsRef={orbitControlsRef} />
      <color attach="background" args={[0.24, 0.24, 0.24]} />
    </>
  )
}

const Wrapper = styled.div`
  tab-size: 4;
  line-height: 1.15; /* 1 */
  -webkit-text-size-adjust: 100%; /* 2 */
  margin: 0;

  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
`

const CanvasWrapper = styled.div`
  display: relative;
  z-index: 0;
  height: 100%;
`

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
`

const Tools = styled.div`
  position: absolute;
  left: 8px;
  top: 6px;
  pointer-events: auto;
`

const SnapshotEditor: React.FC<{}> = () => {
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

  const editorOpen = true
  useLayoutEffect(() => {
    let timeout: NodeJS.Timeout | undefined
    if (editorOpen) {
      // a hack to make sure all the scene's props are
      // applied before we take a snapshot
      timeout = setTimeout(createSnapshot, 100)
    }
    return () => {
      if (timeout !== undefined) {
        clearTimeout(timeout)
      }
    }
  }, [editorOpen])

  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null)

  if (!editorObject) return <></>

  return (
    <root.div>
      <StyleSheetManager disableVendorPrefixes>
        <>
          <GlobalStyle />
          {/* <PortalContext.Provider value={overlay}> */}
          <Wrapper>
            <Overlay ref={setOverlay}>
              <Tools>
                <ToolbarIconButton
                  icon={<IoCameraReverseOutline />}
                  label="Refresh Snapshot"
                  onClick={createSnapshot}
                ></ToolbarIconButton>
              </Tools>
            </Overlay>

            {sceneSnapshot ? (
              <>
                <CanvasWrapper>
                  <Canvas
                    // @ts-ignore
                    colorManagement
                    camera={initialEditorCamera}
                    onCreated={({gl}) => {
                      gl.setClearColor('white')
                    }}
                    shadowMap
                    dpr={[1, 2]}
                    fog={'red'}
                    onPointerMissed={() =>
                      studio.__experimental_setSelection([])
                    }
                  >
                    <EditorScene />
                  </Canvas>
                </CanvasWrapper>
              </>
            ) : null}
          </Wrapper>
          {/* </PortalContext.Provider> */}
        </>
      </StyleSheetManager>
    </root.div>
  )
}

export default SnapshotEditor
