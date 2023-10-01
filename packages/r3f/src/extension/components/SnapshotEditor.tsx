import {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react'
import React from 'react'
import {Canvas, useThree} from '@react-three/fiber'
import type {BaseSheetObjectType} from '../../main/store'
// eslint-disable-next-line import/no-extraneous-dependencies
import {__private_allRegisteredObjects as allRegisteredObjects} from '@theatre/r3f'
import shallow from 'zustand/shallow'
import root from 'react-shadow/styled-components'
import ProxyManager from './ProxyManager'
import studio from '@theatre/studio'
import {useVal} from '@theatre/react'
import styled, {createGlobalStyle, StyleSheetManager} from 'styled-components'
import type {ISheet} from '@theatre/core'
import useSnapshotEditorCamera from './useSnapshotEditorCamera'
import {getEditorSheet, getEditorSheetObject} from '../editorStuff'
import type {$IntentionalAny} from '../../types'
import {InfiniteGridHelper} from '../InfiniteGridHelper'
import {DragDetectorProvider} from './DragDetector'
import ReferenceWindow from './ReferenceWindow/ReferenceWindow'
import useExtensionStore from '../useExtensionStore'
import useMeasure from 'react-use-measure'

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
    font: inherit;
    vertical-align: baseline;
    list-style: none;
  }
`

const EditorScene: React.FC<{snapshotEditorSheet: ISheet; paneId: string}> = ({
  snapshotEditorSheet,
  paneId,
}) => {
  const [gl, scene, camera] = useThree(
    (store) => [store.gl, store.scene, store.camera] as const,
    shallow,
  )

  const [editorCamera, orbitControlsRef] = useSnapshotEditorCamera(
    snapshotEditorSheet,
    paneId,
  )

  const editorObject = getEditorSheetObject()

  const helpersRoot = useExtensionStore((state) => state.helpersRoot, shallow)

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
      <color attach="background" args={[0.1, 0.1, 0.1]} />
    </DragDetectorProvider>
  )
}

const Wrapper = styled.div`
  tab-size: 4;
  line-height: 1.15; /* 1 */
  -webkit-text-size-adjust: 100%; /* 2 */
  margin: 0;

  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
`

const CanvasWrapper = styled.div`
  position: relative;
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
  left: 12px;
  top: 12px;
  pointer-events: auto;
`

const ReferenceWindowContainer = styled.div`
  position: absolute;
  right: 12px;
  top: 12px;
  justify-content: center;
`

const WaitForSceneInitMessage = styled.div<{active?: boolean}>`
  position: absolute;
  margin: auto;
  left: 0;
  right: 0;
  width: 300px;
  top: 12px;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);

  backdrop-filter: blur(14px);
  background: rgba(40, 43, 47, 0.8);

  @supports not (backdrop-filter: blur()) {
    background-color: rgba(40, 43, 47, 0.95);
  }
`

const SnapshotEditor: React.FC<{paneId: string}> = (props) => {
  const snapshotEditorSheet = getEditorSheet()
  const paneId = props.paneId
  const editorObject = getEditorSheetObject()
  const [ref, bounds] = useMeasure()

  const [sceneSnapshot, createSnapshot] = useExtensionStore(
    (state) => [state.sceneSnapshot, state.createSnapshot],
    shallow,
  )

  useLayoutEffect(() => {
    // Create a fresh snapshot when the editor is opened
    createSnapshot()
  }, [])

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

  const [toolsContainer, setToolsContainer] = useState<null | HTMLElement>()

  useEffect(() => {
    if (!toolsContainer) return

    return studio.ui.renderToolset('snapshot-editor', toolsContainer)
  }, [toolsContainer])

  if (!editorObject) return <></>

  const referenceWindowVisibility =
    useVal(getEditorSheetObject()?.props.viewport.referenceWindow) ??
    'minimized'

  return (
    <root.div style={{overflow: 'hidden'}}>
      <StyleSheetManager disableVendorPrefixes>
        <>
          <GlobalStyle />
          <Wrapper>
            <Overlay>
              <Tools ref={setToolsContainer} />
              {referenceWindowVisibility !== 'hidden' && (
                <ReferenceWindowContainer>
                  <ReferenceWindow
                    maxHeight={Math.min(bounds.height * 0.3, 150)}
                    maxWidth={Math.min(bounds.width * 0.3, 250)}
                    minimized={referenceWindowVisibility === 'minimized'}
                    onToggleMinified={() => {
                      studio.transaction(({set}) => {
                        set(
                          getEditorSheetObject()!.props.viewport
                            .referenceWindow,
                          referenceWindowVisibility === 'minimized'
                            ? 'maximized'
                            : 'minimized',
                        )
                      })
                    }}
                  />
                </ReferenceWindowContainer>
              )}
              {!sceneSnapshot && (
                <WaitForSceneInitMessage>
                  The scene hasn't been initialized yet. It will appear in the
                  editor as soon as it is.
                </WaitForSceneInitMessage>
              )}
            </Overlay>

            <CanvasWrapper ref={ref}>
              <Canvas
                onCreated={({gl}) => {
                  gl.setClearColor('white')
                }}
                shadows
                dpr={[1, 2]}
                frameloop="demand"
                onPointerMissed={onPointerMissed}
              >
                <EditorScene
                  snapshotEditorSheet={snapshotEditorSheet}
                  paneId={paneId}
                />
              </Canvas>
            </CanvasWrapper>
          </Wrapper>
        </>
      </StyleSheetManager>
    </root.div>
  )
}

export default SnapshotEditor
