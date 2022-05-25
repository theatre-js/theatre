import {Box} from '@theatre/dataverse'
import {useVal} from '@theatre/react'
import type {IExtension} from '@theatre/studio'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import getStudio from '@theatre/studio/getStudio'
import type {ToolsetConfig} from '@theatre/studio/TheatreStudio'
import React, {useLayoutEffect, useMemo} from 'react'

import styled from 'styled-components'
import Toolset from './Toolset'

const Container = styled.div`
  height: 36px;
  /* pointer-events: none; */

  display: flex;
  gap: 1rem;
  justify-content: center;
`

const Bg = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  border-radius: 4px;
  padding: 6px 6px;

  ${pointerEventsAutoInNormalMode};

  &:hover {
    background-color: rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(4px);
  }
`

const ExtensionToolsetRender: React.FC<{
  extension: IExtension
  toolbarId: string
}> = ({extension, toolbarId}) => {
  const toolsetConfigBox = useMemo(() => new Box<ToolsetConfig>([]), [])

  useLayoutEffect(() => {
    const detach = extension.toolbars?.[toolbarId]?.(
      toolsetConfigBox.set.bind(toolsetConfigBox),
      getStudio()!.publicApi,
    )

    if (typeof detach === 'function') return detach
  }, [extension, toolbarId])

  const config = useVal(toolsetConfigBox.derivation)

  return <Toolset config={config} />
}

export const ExtensionToolbar: React.FC<{toolbarId: string}> = ({
  toolbarId,
}) => {
  const groups: Array<React.ReactNode> = []
  const extensionsById = useVal(getStudio().atomP.ephemeral.extensions.byId)

  for (const [, extension] of Object.entries(extensionsById)) {
    if (!extension || !extension.toolbars?.[toolbarId]) continue

    groups.push(
      <ExtensionToolsetRender
        extension={extension}
        key={'extensionToolbar-' + extension.id}
        toolbarId={toolbarId}
      />,
    )
  }

  if (groups.length === 0) return null

  return <Container>{groups}</Container>
}

export default ExtensionToolbar
