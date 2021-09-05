import type Project from '@theatre/core/projects/Project'

import {usePrism} from '@theatre/react'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import {SheetInstanceItem} from './SheetInstanceItem'

const Head = styled.div`
  display: flex;
`

const Container = styled.li<{isSelected: boolean}>`
  color: ${(props) => (props.isSelected ? 'white' : 'hsl(1, 1%, 80%)')};
`

const Body = styled.div``

export const SheetItem: React.FC<{
  depth: number
  sheetId: string
  project: Project
}> = ({sheetId, depth, project}) => {
  return usePrism(() => {
    const template = val(project.sheetTemplatesP[sheetId])
    if (!template) return <></>
    const allInstances = val(template.instancesP)

    return (
      <>
        {Object.entries(allInstances).map(([_, inst]) => {
          return (
            <SheetInstanceItem
              key={inst.address.sheetInstanceId}
              sheet={inst}
              depth={depth}
            />
          )
        })}
      </>
    )
  }, [depth, sheetId, project])
}
