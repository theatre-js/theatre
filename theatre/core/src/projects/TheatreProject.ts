import {privateAPI, setPrivateAPI} from '@theatre/shared/privateAPIs'
import Project from '@theatre/core/projects/Project'
import type {ISheet} from '@theatre/core/sheets/TheatreSheet'
import type {ProjectAddress} from '@theatre/shared/utils/addresses'
import {validateName} from '@theatre/shared/utils/sanitizers'
import {validateAndSanitiseSlashedPathOrThrow} from '@theatre/shared/utils/slashedPaths'
import type {$IntentionalAny} from '@theatre/shared/utils/types'

export type IProjectConfig = Partial<{
  state: $IntentionalAny
}>

export interface IProject {
  readonly type: 'Theatre_Project_PublicAPI'
  readonly ready: Promise<void>
  /**
   * Shows whether the project is ready to be used.
   * Better to use IProject.ready, which is a promise that will
   * resolve when the project is ready.
   */
  readonly isReady: boolean
  readonly address: ProjectAddress
  sheet(sheetId: string, instanceId?: string): ISheet
}

export default class TheatreProject implements IProject {
  get type(): 'Theatre_Project_PublicAPI' {
    return 'Theatre_Project_PublicAPI'
  }
  /**
   * @internal
   */
  constructor(id: string, config: IProjectConfig = {}) {
    setPrivateAPI(this, new Project(id, config, this))
  }

  get ready(): Promise<void> {
    return privateAPI(this).ready
  }

  get isReady(): boolean {
    return privateAPI(this).isReady()
  }

  get address(): ProjectAddress {
    return {...privateAPI(this).address}
  }

  sheet(sheetId: string, instanceId: string = 'default'): ISheet {
    const sanitizedPath = validateAndSanitiseSlashedPathOrThrow(
      sheetId,
      'project.sheet',
    )

    if (process.env.NODE_ENV !== 'production') {
      validateName(
        instanceId,
        'instanceId in project.sheet(sheetId, instanceId)',
        true,
      )
    }

    return privateAPI(this).getOrCreateSheet(sanitizedPath, instanceId)
      .publicApi
  }
}
