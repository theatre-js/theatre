import {getRegisteredSheetIds} from '@theatre/studio/selectors'
import {usePrism} from '@theatre/react'
import React from 'react'
import {SheetItem} from './SheetItem'
import type Project from '@theatre/core/projects/Project'

const SheetsList: React.FC<{
  project: Project
  depth: number
}> = ({project, depth}) => {
  return usePrism(() => {
    if (!project) return null

    const registeredSheetIds = getRegisteredSheetIds(project)

    return (
      <>
        {registeredSheetIds.map((sheetId) => {
          return (
            <SheetItem
              depth={depth}
              sheetId={sheetId}
              key={`sheet-${sheetId}`}
              project={project}
            ></SheetItem>
          )
        })}
      </>
    )
  }, [project, depth])
}

export default SheetsList
