import type Sheet from '@theatre/core/sheets/Sheet'
import {usePrism} from '@theatre/react'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import {ObjectItem} from './ObjectItem'

export const Li = styled.li<{isSelected: boolean}>`
  color: ${(props) => (props.isSelected ? 'white' : 'hsl(1, 1%, 80%)')};
`

const ObjectsList: React.FC<{
  depth: number
  sheet: Sheet
}> = ({sheet, depth}) => {
  return usePrism(() => {
    const objects = val(sheet.objectsP)
    const objectsEntries = Object.entries(objects)

    return (
      <>
        {objectsEntries
          .sort(([pathA], [pathB]) => (pathA > pathB ? 1 : -1))
          .map(([objectPath, object]) => {
            return (
              <ObjectItem
                depth={depth}
                key={'objectPath(' + objectPath + ')'}
                sheetObject={object!}
              />
            )
          })}
      </>
    )
  }, [sheet, depth])
}

export default ObjectsList
