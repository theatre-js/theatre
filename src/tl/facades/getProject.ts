import TheatreJSProject, {
  TheatreJSProjectConf,
} from '$tl/facades/TheatreJSProject'
import projectsSingleton from '$tl/Project/projectsSingleton'
import {InvalidArgumentError} from '$tl/handy/errors'
import {$OnDiskState, OnDiskState} from '$tl/Project/store/types'
import {userFacingReoprter} from '$shared/ioTypes/userFacingReporter'
import userReadableTypeOfValue from '$shared/utils/userReadableTypeOfValue'

export default function getProject(
  id: string,
  config: TheatreJSProjectConf & Partial<{reuseExistingProject: boolean}> = {},
): TheatreJSProject {
  const {reuseExistingProject, ...restOfConfig} = config
  if (projectsSingleton.has(id)) {
    if (reuseExistingProject === true) {
      return projectsSingleton.get(id)!.facade
    }
    throw new InvalidArgumentError(
      `Looks like you're calling \`Theatre.getProject("${id}", ...)\` twice. ` +
        `If you're trying to make two separate projects, make sure to assign a unique ID to each of them. ` +
        `Otherwise, if you're trying to use the existing project named "${id}", then set \`reuseExistingProject\` to true.\n` +
        ` Example: \`Theatre.getProject("${id}", {reuseExistingProject: true})\``,
    )
  }
  if ($env.NODE_ENV === 'development' || $env.tl.isCore === false) {
    validateProjectIdOrThrow(id)
  }
  if ($env.tl.isCore) {
    if (!config.state) {
      throw new InvalidArgumentError(
        `Argument config.state in Theatre.getProject("${id}", config) cannot be empty in theatre/core. Read more at https://theatrejs.com/docs/state-persistence.html`,
      )
    }
    shallowValidateOnDiskState(id, config.state)
  } else {
    if (config.state) {
      deepValidateOnDiskState(id, config.state)
    }
  }

  return new TheatreJSProject(id, restOfConfig)
}

/**
 * Does a thorough validation of the onDisk state.
 */
const deepValidateOnDiskState = (projectId: string, s: OnDiskState) => {
  const validationResult = $OnDiskState.validate(s)

  if (validationResult.isLeft()) {
    console.group(
      `Argument config.state in Theatre.getProject("${projectId}", config) is invalid. Lean how to fix this at https://theatrejs.com/docs/state-persistence.html#troubleshooting`,
    )
    const errors = userFacingReoprter(validationResult)
    errors.forEach(e => console.log(e))
    console.groupEnd()

    throw new InvalidArgumentError(
      `Argument config.state in Theatre.getProject("${projectId}", config) is invalid. Lean how to fix this at https://theatrejs.com/docs/state-persistence.html#troubleshooting`,
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
      `Error validating conf.state in Theatre.getProject(${JSON.stringify(
        projectId,
      )}, conf). The state seems to be formatted in a way that is unreadable to Theatre.js. Read more at https://theatrejs.com/docs/state-persistence.html`,
    )
  }
}

const validateProjectIdOrThrow = (id: string) => {
  if (typeof id !== 'string') {
    throw new InvalidArgumentError(
      `Argument 'id' in \`Theatre.getProject(id, ...)\` must be a string. Instead, it was ${userReadableTypeOfValue(
        id,
      )}.`,
    )
  }

  const idTrimmed = id.trim()
  if (idTrimmed.length !== id.length) {
    throw new InvalidArgumentError(
      `Argument 'id' in \`Theatre.getProject("${id}", ...)\` should not have surrounding whitespace.`,
    )
  }

  if (idTrimmed.length < 3) {
    throw new InvalidArgumentError(
      `Argument 'id' in \`Theatre.getProject("${id}", ...)\` should be at least 3 characters long.`,
    )
  }
}
