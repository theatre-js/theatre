import {Atom} from '@theatre/dataverse'
import {useVal} from '@theatre/react'
import type {IExtension} from '@theatre/studio'
import getStudio from '@theatre/studio/getStudio'
import type {ToolsetConfig} from '@theatre/studio/TheatreStudio'
import React, {useLayoutEffect, useMemo} from 'react'

import styled from 'styled-components'
import Toolset from './Toolset'

const Container = styled.div`
  height: 36px;
  /* pointer-events: none; */

  display: flex;
  gap: 0.5rem;
  justify-content: center;
`

const GroupDivider = styled.div`
  position: abolute;
  height: 32px;
  width: 1px;
  background: #373b40;
  opacity: 0.4;
`

const ExtensionToolsetRender: React.FC<{
  extension: IExtension
  toolbarId: string
}> = ({extension, toolbarId}) => {
  const toolsetConfigBox = useMemo(() => new Atom<ToolsetConfig>([]), [])

  useLayoutEffect(() => {
    const detach = extension.toolbars?.[toolbarId]?.(
      toolsetConfigBox.set.bind(toolsetConfigBox),
      getStudio()!.publicApi,
    )

    if (typeof detach === 'function') return detach
  }, [extension, toolbarId])

  const config = useVal(toolsetConfigBox.prism)

  return <Toolset config={config} />
}

export const ExtensionToolbar: React.FC<{
  toolbarId: string
  showLeftDivider?: boolean
}> = ({toolbarId, showLeftDivider}) => {
  const groups: Array<React.ReactNode> = []
  const extensionsById = useVal(getStudio().atomP.ephemeral.extensions.byId)

  let isAfterFirstGroup = false
  for (const [, extension] of Object.entries(extensionsById)) {
    if (!extension || !extension.toolbars?.[toolbarId]) continue

    groups.push(
      <React.Fragment key={'extensionToolbar-' + extension.id}>
        {isAfterFirstGroup ? <GroupDivider></GroupDivider> : undefined}
        <ExtensionToolsetRender extension={extension} toolbarId={toolbarId} />
      </React.Fragment>,
    )

    isAfterFirstGroup = true
  }

  if (groups.length === 0) return null

  return (
    <Container>
      {showLeftDivider ? <GroupDivider></GroupDivider> : undefined}
      {groups}
    </Container>
  )
}

export default ExtensionToolbar
