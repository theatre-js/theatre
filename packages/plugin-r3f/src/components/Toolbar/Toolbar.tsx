import type {VFC} from 'react'
import {useState} from 'react'
import React from 'react'
import TransformControlsModeSelect from './TransformControlsModeSelect'
import {useEditorStore} from '../../store'
import shallow from 'zustand/shallow'
import TransformControlsSpaceSelect from './TransformControlsSpaceSelect'
import ViewportShadingSelect from './ViewportShadingSelect'
import {GiPocketBow, RiFocus3Line} from 'react-icons/all'
import {Vector3} from 'three'
import type {$FixMe} from '@theatre/shared/utils/types'
import studio from '@theatre/studio'
import {getSelected} from '../useSelected'
import {useVal} from '@theatre/dataverse-react'
import IconButton from './utils/IconButton'
import {PortalContext} from 'reakit'
import styled from 'styled-components'

const Container = styled.div`
  z-index: 50;
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  pointer-events: none;
`

const TopRow = styled.div`
  position: relative;
  margin: 1.25rem;
  height: 100%;

  display: flex;
  flex: 1 1 0%;
  justify-content: space-between;
  align-items: flex-start;
`

const Tools = styled.div`
  display: flex;
  gap: 1rem;
`

const ToolGroup = styled.div`
  pointer-events: auto;
`

const Toolbar: VFC = () => {
  const [editorObject] = useEditorStore(
    (state) => [state.editorObject],
    shallow,
  )

  const transformControlsMode =
    useVal(editorObject?.props.transformControls.mode) ?? 'translate'
  const transformControlsSpace =
    useVal(editorObject?.props.transformControls.space) ?? 'world'
  const viewportShading =
    useVal(editorObject?.props.viewport.shading) ?? 'rendered'

  const [wrapper, setWrapper] = useState<null | HTMLDivElement>(null)

  if (!editorObject) return <></>

  return (
    <PortalContext.Provider value={wrapper}>
      <Container ref={setWrapper}>
        <TopRow>
          <Tools>
            <ToolGroup>
              <TransformControlsModeSelect
                value={transformControlsMode}
                onChange={(value) =>
                  studio.transaction(({set}) =>
                    set(editorObject!.props.transformControls.mode, value),
                  )
                }
              />
            </ToolGroup>
            <ToolGroup>
              <TransformControlsSpaceSelect
                value={transformControlsSpace}
                onChange={(space) => {
                  studio.transaction(({set}) => {
                    set(editorObject.props.transformControls.space, space)
                  })
                }}
              />
            </ToolGroup>
            <ToolGroup>
              <ViewportShadingSelect
                value={viewportShading}
                onChange={(shading) => {
                  studio.transaction(({set}) => {
                    set(editorObject.props.viewport.shading, shading)
                  })
                }}
              />
            </ToolGroup>
            <ToolGroup>
              <IconButton
                label="Focus on selected"
                icon={<RiFocus3Line />}
                onClick={() => {
                  const orbitControls =
                    useEditorStore.getState().orbitControlsRef?.current
                  const selected = getSelected()

                  let focusObject

                  if (selected) {
                    focusObject =
                      useEditorStore.getState().editablesSnapshot![selected]
                        .proxyObject
                  }

                  if (orbitControls && focusObject) {
                    focusObject.getWorldPosition(
                      // @ts-ignore TODO
                      orbitControls.target as Vector3,
                    )
                  }
                }}
              />
            </ToolGroup>
            <ToolGroup>
              <IconButton
                label="Align object to view"
                icon={<GiPocketBow />}
                onClick={() => {
                  const camera = (
                    useEditorStore.getState().orbitControlsRef
                      ?.current as $FixMe
                  )?.object

                  const selected = getSelected()

                  let proxyObject

                  if (selected) {
                    proxyObject =
                      useEditorStore.getState().editablesSnapshot![selected]
                        .proxyObject

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
              />
            </ToolGroup>
          </Tools>
        </TopRow>
      </Container>
    </PortalContext.Provider>
  )
}

export default Toolbar
