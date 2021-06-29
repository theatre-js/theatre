import {usePrism} from '@theatre/dataverse-react'
import {val} from '@theatre/dataverse'
import React from 'react'
import BrowserStateIsNotBasedOnDiskStateModal from './BrowserStateIsNotBasedOnDiskStateModal'
import getStudio from '@theatre/studio/getStudio'

const EnsureProjectsDontHaveErrors: React.FC<{}> = ({children}) => {
  return usePrism(() => {
    const projects = val(getStudio().projectsP)

    const projectIds = Object.keys(projects)
    for (const projectId of projectIds) {
      const project = projects[projectId]
      const loadingStateType = val(project.pointers.ephemeral.loadingState.type)
      if (loadingStateType === 'browserStateIsNotBasedOnDiskState') {
        return <BrowserStateIsNotBasedOnDiskStateModal projectId={projectId} />
      }
    }

    return <div>{children}</div>
  }, [children])
}

export default EnsureProjectsDontHaveErrors
