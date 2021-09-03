import projectsSingleton from '@theatre/core/projects/projectsSingleton'
import type {OnDiskState} from '@theatre/core/projects/store/storeTypes'
import type {
  IProject,
  IProjectConfig,
} from '@theatre/core/projects/TheatreProject'
import TheatreProject from '@theatre/core/projects/TheatreProject'
import globals from '@theatre/shared/globals'
import * as types from '@theatre/core/propTypes'
import {InvalidArgumentError} from '@theatre/shared/utils/errors'
import {validateName} from '@theatre/shared/utils/sanitizers'
import userReadableTypeOfValue from '@theatre/shared/utils/userReadableTypeOfValue'
import deepEqual from 'fast-deep-equal'
export {types}

/**
 * Returns a project of the given id, or creates one if it doesn't already exist.
 *
 * If @theatre/studio is also loaded, then the state of the project will be managed by the studio.
 *
 * Usage:
 * ```ts
 * import {getProject} from '@theatre/core'
 * const config = {} // the config can be empty when starting a new project
 * const project = getProject("a-unique-id", config)
 * ```
 *
 * Usage with an explicit state:
 * ```ts
 * import {getProject} from '@theatre/core'
 * import state from './saved-state.json'
 * const config = {state} // here the config contains our saved state
 * const project = getProject("a-unique-id", config)
 * ```
 */
export function getProject(id: string, config: IProjectConfig = {}): IProject {
  const {...restOfConfig} = config
  const existingProject = projectsSingleton.get(id)
  if (existingProject) {
    if (process.env.NODE_ENV !== 'production') {
      if (!deepEqual(config, existingProject.config)) {
        throw new Error(
          `You seem to have called Theatre.getProject("${id}", config) twice, with different config objects. ` +
            `This is disallowed because changing the config of a project on the fly can lead to hard-to-debug issues.\n\n` +
            `You can fix this by either calling Theatre.getProject() once per project-id,` +
            ` or calling it multiple times but with the exact same config.`,
        )
      }
    }
    return existingProject.publicApi
  }

  if (process.env.NODE_ENV !== 'production') {
    validateName(id, 'projectName in Theatre.getProject(projectName)', true)
    validateProjectIdOrThrow(id)
  }

  if (config.state) {
    if (process.env.NODE_ENV !== 'production') {
      shallowValidateOnDiskState(id, config.state)
    } else {
      deepValidateOnDiskState(id, config.state)
    }
  }

  return new TheatreProject(id, restOfConfig)
}

/**
 * Lightweight validator that only makes sure the state's definitionVersion is correct.
 * Does not do a thorough validation of the state.
 */
const shallowValidateOnDiskState = (projectId: string, s: OnDiskState) => {
  if (
    Array.isArray(s) ||
    s == null ||
    s.definitionVersion !== globals.currentProjectStateDefinitionVersion
  ) {
    throw new InvalidArgumentError(
      `Error validating conf.state in Theatre.getProject(${JSON.stringify(
        projectId,
      )}, conf). The state seems to be formatted in a way that is unreadable to Theatre.js. Read more at https://docs.theatrejs.com`,
    )
  }
}

const deepValidateOnDiskState = (projectId: string, s: OnDiskState) => {
  shallowValidateOnDiskState(projectId, s)
  // @TODO do a deep validation here
}

const validateProjectIdOrThrow = (value: string) => {
  if (typeof value !== 'string') {
    throw new InvalidArgumentError(
      `Argument 'name' in \`Theatre.getProject(name, ...)\` must be a string. Instead, it was ${userReadableTypeOfValue(
        value,
      )}.`,
    )
  }

  const idTrimmed = value.trim()
  if (idTrimmed.length !== value.length) {
    throw new InvalidArgumentError(
      `Argument 'name' in \`Theatre.getProject("${value}", ...)\` should not have surrounding whitespace.`,
    )
  }

  if (idTrimmed.length < 3) {
    throw new InvalidArgumentError(
      `Argument 'name' in \`Theatre.getProject("${value}", ...)\` should be at least 3 characters long.`,
    )
  }
}
