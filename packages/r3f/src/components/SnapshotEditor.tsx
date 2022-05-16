import {useCallback, useLayoutEffect, useMemo} from 'react'
import React from 'react'
import {Canvas} from '@react-three/fiber'
import type {BaseSheetObjectType} from '../store'
import {allRegisteredObjects, useEditorStore} from '../store'
import shallow from 'zustand/shallow'
import root from 'react-shadow/styled-components'
import ProxyManager from './ProxyManager'
import studio, {ToolbarIconButton} from '@theatre/studio'
import {useVal} from '@theatre/react'
import styled, {createGlobalStyle, StyleSheetManager} from 'styled-components'
import {IoCameraReverseOutline} from 'react-icons/io5'
import type {ISheet} from '@theatre/core'
import useSnapshotEditorCamera from './useSnapshotEditorCamera'
import {getEditorSheet, getEditorSheetObject} from './editorStuff'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {InfiniteGridHelper} from '../InfiniteGridHelper'
import {DragDetectorProvider} from './DragDetector'

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

const EditorScene: React.FC<{snapshotEditorSheet: ISheet; paneId: string}> = ({
  snapshotEditorSheet,
  paneId,
}) => {
  const [editorCamera, orbitControlsRef] = useSnapshotEditorCamera(
    snapshotEditorSheet,
    paneId,
  )

  const editorObject = getEditorSheetObject()

  const helpersRoot = useEditorStore((state) => state.helpersRoot, shallow)

  const showGrid = useVal(editorObject?.props.viewport.showGrid) ?? true
  const showAxes = useVal(editorObject?.props.viewport.showAxes) ?? true

  const grid = useMemo(() => new InfiniteGridHelper(), [])

  return (
    <DragDetectorProvider>
      {showGrid && <primitive object={grid} />}
      {showAxes && <axesHelper args={[500]} />}
      {editorCamera}

      <primitive object={helpersRoot}></primitive>
      <ProxyManager orbitControlsRef={orbitControlsRef} />
      <color attach="background" args={[0.24, 0.24, 0.24]} />
    </DragDetectorProvider>
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
  overflow: hidden;
`

const CanvasWrapper = styled.div`
  display: relative;
  z-index: 0;
  height: 100%;
  overflow: hidden;
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

const SnapshotEditor: React.FC<{paneId: string}> = (props) => {
  const snapshotEditorSheet = getEditorSheet()
  const paneId = props.paneId
  const editorObject = getEditorSheetObject()

  const [sceneSnapshot, createSnapshot] = useEditorStore(
    (state) => [state.sceneSnapshot, state.createSnapshot],
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

  const onPointerMissed = useCallback(() => {
    // This callback runs when the user clicks in an empty space inside a SnapshotEditor.
    // We'll try to set the current selection to the nearest sheet _if_ at least one object
    // belonging to R3F was selected previously.
    const obj: undefined | BaseSheetObjectType = studio.selection.find(
      (sheetOrObject) =>
        allRegisteredObjects.has(sheetOrObject as $IntentionalAny),
    ) as $IntentionalAny

    if (obj) {
      studio.setSelection([obj.sheet])
    }
  }, [])

  if (!editorObject) return <></>

  return (
    <root.div style={{overflow: 'hidden'}}>
      <StyleSheetManager disableVendorPrefixes>
        <>
          <GlobalStyle />
          <Wrapper>
            <Overlay>
              <Tools>
                <ToolbarIconButton
                  title="Refresh Snapshot"
                  onClick={createSnapshot}
                >
                  <IoCameraReverseOutline />
                </ToolbarIconButton>
              </Tools>
            </Overlay>

            {sceneSnapshot ? (
              <>
                <CanvasWrapper>
                  <Canvas
                    // @ts-ignore
                    colorManagement
                    onCreated={({gl}) => {
                      gl.setClearColor('white')
                    }}
                    shadowMap
                    dpr={[1, 2]}
                    fog={'red'}
                    frameloop="demand"
                    onPointerMissed={onPointerMissed}
                  >
                    <EditorScene
                      snapshotEditorSheet={snapshotEditorSheet}
                      paneId={paneId}
                    />
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
