import projectsSingleton from './projects/projectsSingleton'
import TheatreProject from './projects/TheatreProject'
import * as types from './propTypes'
import {validateName} from '@theatre/utils/sanitizers'
import deepEqual from 'fast-deep-equal'
import type {PointerType, Prism} from '@theatre/dataverse'
import {isPointer} from '@theatre/dataverse'
import {isPrism, pointerToPrism} from '@theatre/dataverse'
import type {$IntentionalAny, VoidFn} from '@theatre/utils/types'
import type {ProjectId} from '@theatre/core/types/public'
import {getCoreTicker} from './coreTicker'
import {privateAPI} from './privateAPIs'
export {notify} from '@theatre/core/utils/notify'
export {types}
export {createRafDriver} from './rafDrivers'
import * as propTypeUtils from './propTypes/utils'
import * as ids from './utils/ids'
import * as keyframeUtils from './utils/keyframeUtils'
import * as instanceTypes from './utils/instanceTypes'
import {globals} from './globals'
import {
  deepValidateOnDiskState,
  shallowValidateOnDiskState,
  validateProjectIdOrThrow,
} from './projects/Project'
import type {IProjectConfig, IProject, IRafDriver} from './types/public'

export const __private = {
  propTypeUtils,
  ids,
  instanceTypes,
  keyframeUtils,
  currentProjectStateDefinitionVersion:
    globals.currentProjectStateDefinitionVersion,
}

/**
 * Returns a project of the given id, or creates one if it doesn't already exist.
 *
 * @remarks
 * If \@theatre/studio is also loaded, then the state of the project will be managed by the studio.
 *
 * [Learn more about exporting](https://www.theatrejs.com/docs/latest/manual/projects#state)
 *
 * @example
 * Usage:
 * ```ts
 * import {getProject} from '@theatre/core'
 * const config = {} // the config can be empty when starting a new project
 * const project = getProject("a-unique-id", config)
 * ```
 *
 * @example
 * Usage with an explicit state:
 * ```ts
 * import {getProject} from '@theatre/core'
 * import state from './saved-state.json'
 * const config = {state} // here the config contains our saved state
 * const project = getProject("a-unique-id", config)
 * ```
 */
export function getProject(id: string, config: IProjectConfig = {}): IProject {
  const existingProject = projectsSingleton.get(id as ProjectId)
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
      shallowValidateOnDiskState(id as ProjectId, config.state)
    } else {
      deepValidateOnDiskState(id as ProjectId, config.state)
    }
  } else {
  }

  return new TheatreProject(id, config)
}

/**
 * Calls `callback` every time the pointed value of `pointer` changes.
 *
 * @param pointer - A Pointer (like `object.props.x`)
 * @param callback - The callback is called every time the value of pointer changes
 * @param rafDriver - (optional) The `rafDriver` to use. Learn how to use `rafDriver`s [from the docs](https://www.theatrejs.com/docs/latest/manual/advanced#rafdrivers).
 * @returns An unsubscribe function
 *
 * @example
 * Usage:
 * ```ts
 * import {getProject, onChange} from '@theatre/core'
 *
 * const obj = getProject("A project").sheet("Scene").object("Box", {position: {x: 0}})
 *
 * const usubscribe = onChange(obj.props.position.x, (x) => {
 *   console.log('position.x changed to:', x)
 * })
 *
 * setTimeout(usubscribe, 10000) // stop listening to changes after 10 seconds
 * ```
 */
export function onChange<
  P extends PointerType<$IntentionalAny> | Prism<$IntentionalAny>,
>(
  pointer: P,
  callback: (
    value: P extends PointerType<infer T>
      ? T
      : P extends Prism<infer T>
        ? T
        : unknown,
  ) => void,
  rafDriver?: IRafDriver,
): VoidFn {
  const ticker = rafDriver ? privateAPI(rafDriver).ticker : getCoreTicker()

  if (isPointer(pointer)) {
    const pr = pointerToPrism(pointer)
    return pr.onChange(ticker, callback as $IntentionalAny, true)
  } else if (isPrism(pointer)) {
    return pointer.onChange(ticker, callback as $IntentionalAny, true)
  } else {
    throw new Error(
      `Called onChange(p) where p is neither a pointer nor a prism.`,
    )
  }
}

/**
 * Takes a Pointer and returns the value it points to.
 *
 * @param pointer - A pointer (like `object.props.x`)
 * @returns The value the pointer points to
 *
 * @example
 *
 * Usage
 * ```ts
 * import {val, getProject} from '@theatre/core'
 *
 * const obj = getProject("A project").sheet("Scene").object("Box", {position: {x: 0}})
 *
 * console.log(val(obj.props.position.x)) // logs the value of obj.props.x
 * ```
 */
export function val<T>(pointer: PointerType<T>): T {
  if (isPointer(pointer)) {
    return pointerToPrism(pointer).getValue() as $IntentionalAny
  } else {
    throw new Error(`Called val(p) where p is not a pointer.`)
  }
}
