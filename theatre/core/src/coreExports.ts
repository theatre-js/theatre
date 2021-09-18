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
import type {IDerivation, PointerType} from '@theatre/dataverse'
import {isPointer} from '@theatre/dataverse'
import {isDerivation, valueDerivation} from '@theatre/dataverse'
import type {$IntentionalAny, VoidFn} from '@theatre/shared/utils/types'
import coreTicker from './coreTicker'
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
 *
 * Learn more about exporting https://docs.theatrejs.com/in-depth/#exporting
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
            `You can fix this by either calling Theatre.getProject() once per projectId,` +
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
      `Argument 'projectId' in \`Theatre.getProject(projectId, ...)\` must be a string. Instead, it was ${userReadableTypeOfValue(
        value,
      )}.`,
    )
  }

  const idTrimmed = value.trim()
  if (idTrimmed.length !== value.length) {
    throw new InvalidArgumentError(
      `Argument 'projectId' in \`Theatre.getProject("${value}", ...)\` should not have surrounding whitespace.`,
    )
  }

  if (idTrimmed.length < 3) {
    throw new InvalidArgumentError(
      `Argument 'projectId' in \`Theatre.getProject("${value}", ...)\` should be at least 3 characters long.`,
    )
  }
}

/**
 * Calls `callback` every time the pointed value of `pointer` changes.
 *
 * @param pointer A pointer (like `object.props.x`)
 * @param callback The callback is called every time the value of pointerOrDerivation changes
 * @returns An unsubscribe function
 */
export function onChange<O, P extends PointerType<O> | IDerivation<O>>(
  pointer: P,
  callback: (value: O) => void,
): VoidFn {
  if (isPointer(pointer)) {
    const derivation = valueDerivation(pointer)
    return derivation.tapImmediate(coreTicker, callback as $IntentionalAny)
  } else if (isDerivation(pointer)) {
    return pointer.tapImmediate(coreTicker, callback as $IntentionalAny)
  } else {
    throw new Error(
      `Called onChange(p) where p is neither a pointer nor a derivation.`,
    )
  }
}
