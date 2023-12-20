import {privateAPI, setPrivateAPI} from '@theatre/core/privateAPIs'
import Project from '@theatre/core/projects/Project'
import type {Asset, ProjectAddress} from '@theatre/core/types/public'
import type {
  ProjectId,
  SheetId,
  SheetInstanceId,
} from '@theatre/core/types/public'
import {validateInstanceId} from '@theatre/utils/sanitizers'
import {validateAndSanitiseSlashedPathOrThrow} from '@theatre/utils/slashedPaths'
import type {IProject, IProjectConfig, ISheet} from '@theatre/core/types/public'
import {notify} from '@theatre/core/coreExports'

// export type IProjectConfigExperiments = {
//   /**
//    * Defaults to using global `console` with style args.
//    *
//    * (TODO: check for browser environment before using style args)
//    */
//   /**
//    * Defaults:
//    *  * `production` builds: console - error
//    *  * `development` builds: console - error, warning
//    */
// }

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

  getAssetUrl(asset: Asset): string | undefined {
    // probably should put this in project.getAssetUrl but this will do for now
    if (!this.isReady) {
      console.error(
        'Calling `project.getAssetUrl()` before `project.ready` is resolved, will always return `undefined`. ' +
          'Either use `project.ready.then(() => project.getAssetUrl())` or `await project.ready` before calling `project.getAssetUrl()`.',
      )
      return undefined
    }

    return asset.id
      ? privateAPI(this).assetStorage.getAssetUrl(asset.id)
      : undefined
  }

  sheet(sheetId: string, instanceId: string = 'default'): ISheet {
    const sanitizedPath = validateAndSanitiseSlashedPathOrThrow(
      sheetId,
      'project.sheet',
      notify.warning,
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
