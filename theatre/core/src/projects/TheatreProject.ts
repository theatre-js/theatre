import {privateAPI, setPrivateAPI} from '@theatre/core/privateAPIs'
import Project from '@theatre/core/projects/Project'
import type {ISheet} from '@theatre/core/sheets/TheatreSheet'

import type {ProjectAddress} from '@theatre/shared/utils/addresses'
import type {
  ProjectId,
  SheetId,
  SheetInstanceId,
} from '@theatre/shared/utils/ids'
import {validateInstanceId} from '@theatre/shared/utils/sanitizers'
import {validateAndSanitiseSlashedPathOrThrow} from '@theatre/shared/utils/slashedPaths'
import type {$IntentionalAny} from '@theatre/shared/utils/types'

/**
 * A project's config object (currently the only point of configuration is the project's state)
 */
export type IProjectConfig = {
  /**
   * The state of the project, as [exported](https://docs.theatrejs.com/in-depth/#exporting) by the studio.
   */
  state?: $IntentionalAny
  // experiments?: IProjectConfigExperiments
}

// export type IProjectConfigExperiments = {
//   /**
//    * Defaults to using global `console` with style args.
//    *
//    * (TODO: check for browser environment before using style args)
//    */
//   logger?: ITheatreLoggerConfig
//   /**
//    * Defaults:
//    *  * `production` builds: console - error
//    *  * `development` builds: console - error, warning
//    */
//   logging?: ITheatreLoggingConfig
// }

/**
 * A Theatre.js project
 */
export interface IProject {
  readonly type: 'Theatre_Project_PublicAPI'
  /**
   * If `@theatre/studio` is used, this promise would resolve when studio has loaded
   * the state of the project into memory.
   *
   * If `@theatre/studio` is not used, this promise is already resolved.
   */
  readonly ready: Promise<void>
  /**
   * Shows whether the project is ready to be used.
   * Better to use {@link IProject.ready}, which is a promise that would
   * resolve when the project is ready.
   */
  readonly isReady: boolean
  /**
   * The project's address
   */
  readonly address: ProjectAddress

  /**
   * Creates a Sheet under the project
   * @param sheetId - Sheets are identified by their `sheetId`, which must be a string longer than 3 characters
   * @param instanceId - Optionally provide an `instanceId` if you want to create multiple instances of the same Sheet
   * @returns The newly created Sheet
   *
   * **Docs: https://docs.theatrejs.com/in-depth/#sheets**
   */
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
    setPrivateAPI(this, new Project(id as ProjectId, config, this))
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
      validateInstanceId(
        instanceId,
        'instanceId in project.sheet(sheetId, instanceId)',
        true,
      )
    }

    return privateAPI(this).getOrCreateSheet(
      sanitizedPath as SheetId,
      instanceId as SheetInstanceId,
    ).publicApi
  }
}
