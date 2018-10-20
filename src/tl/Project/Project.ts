import InternalProject, {Conf} from '$tl/Project/InternalProject'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import {validateAndSanitiseSlashedPathOrThrow} from '$tl/handy/slashedPaths'
import {InvalidArgumentError} from '../handy/errors'
import {OnDiskState, $OnDiskState} from '$tl/Project/store/types'
import {userFacingReoprter} from '../../shared/ioTypes/userFacingReporter'

const internalProjectsWeakmap = new WeakMap<Project, InternalProject>()

const getInternalProject = (p: Project) =>
  (internalProjectsWeakmap.get(p) as $IntentionalAny) as InternalProject

const validateProjectIdOrThrow = (id: string) => {
  if (typeof id !== 'string') {
    throw new InvalidArgumentError(
      `Argument 'id' in \`new Project(id, ...)\` must be a string. ${typeof id} given.`,
    )
  }

  const idTrimmed = id.trim()
  if (idTrimmed.length !== id.length) {
    throw new InvalidArgumentError(
      `Argument 'id' in \`new Project("${id}", ...)\` should not have surrounding whitespace.`,
    )
  }

  if (idTrimmed.length < 3) {
    throw new InvalidArgumentError(
      `Argument 'id' in \`new Project("${id}", ...)\` be at least 3 characters long.`,
    )
  }
}

/**
 * Lightweight validator that only makes sure the state's definitionVersion is correct.
 * Does not do a thorough validation of the state.
 */
const shallowValidateOnDiskState = (projectId: string, s: OnDiskState) => {
  if (
    Array.isArray(s) ||
    s == null ||
    s.definitionVersion !== $env.tl.currentProjectStateDefinitionVersion
  ) {
    throw new InvalidArgumentError(
      `Error validating conf.state in new Project(${JSON.stringify(
        projectId,
      )}, conf). The state seems to be formatted in a way that is unreadable to Theatre.js. Read more at https://theatrejs.com/docs/state-persistence.html`,
    )
  }
}

/**
 * Does a thorough validation of the onDisk state.
 */
const deepValidateOnDiskState = (projectId: string, s: OnDiskState) => {
  const validationResult = $OnDiskState.validate(s)

  if (validationResult.isLeft()) {
    console.group(
      `Argument config.state in new Project("${projectId}", config) is invalid. Lean how to fix this at https://theatrejs.com/docs/state-persistence.html#troubleshooting`,
    )
    const errors = userFacingReoprter(validationResult)
    errors.forEach(e => console.log(e))
    console.groupEnd()

    throw new InvalidArgumentError(
      `Argument config.state in new Project("${projectId}", config) is invalid. Lean how to fix this at https://theatrejs.com/docs/state-persistence.html#troubleshooting`,
    )
  }
}

// User-facing facade for InternalProject
export default class Project {
  constructor(id: string, config: Conf = {}) {
    if ($env.NODE_ENV === 'development' || $env.tl.isCore === false) {
      validateProjectIdOrThrow(id)
    }
    if ($env.tl.isCore) {
      if (!config.state) {
        throw new InvalidArgumentError(
          `Argument config.state in new Project("${id}", config) cannot be empty in theatre/core. Read more at https://theatrejs.com/docs/state-persistence.html`,
        )
      }
      shallowValidateOnDiskState(id, config.state)
    } else {
      if (config.state) {
        deepValidateOnDiskState(id, config.state)
      }
    }
    internalProjectsWeakmap.set(this, new InternalProject(id, config))
  }

  getTimeline(_path: string, instanceId: string = 'default'): TimelineInstance {
    const path = validateAndSanitiseSlashedPathOrThrow(
      _path,
      'project.getTimeline',
    )

    return getInternalProject(this).getTimeline(path, instanceId)
  }

  get adapters() {
    return getInternalProject(this).adapters
  }

  get ready() {
    return getInternalProject(this).ready
  }

  get isReady() {
    return getInternalProject(this).isReady
  }
}
