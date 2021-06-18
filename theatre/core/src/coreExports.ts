import projectsSingleton from '@theatre/core/projects/projectsSingleton'
import type {OnDiskState} from '@theatre/core/projects/store/storeTypes'
import type {
  IProject,
  IProjectConfig,
} from '@theatre/core/projects/TheatreProject'
import TheatreProject from '@theatre/core/projects/TheatreProject'
import * as types from '@theatre/shared/propTypes'
import {InvalidArgumentError} from '@theatre/shared/utils/errors'
import {validateName} from '@theatre/shared/utils/sanitizers'
import userReadableTypeOfValue from '@theatre/shared/utils/userReadableTypeOfValue'
export {types}

export function getProject(id: string, config: IProjectConfig = {}): IProject {
  const {...restOfConfig} = config
  if (projectsSingleton.has(id)) {
    return projectsSingleton.get(id)!.publicApi
  }

  if ($env.NODE_ENV === 'development') {
    validateName(id, 'projectName in Theatre.getProject(projectName)', true)
    validateProjectIdOrThrow(id)
  }

  if (config.state) {
    if ($env.NODE_ENV === 'development') {
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
    s.definitionVersion !== $env.currentProjectStateDefinitionVersion
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
