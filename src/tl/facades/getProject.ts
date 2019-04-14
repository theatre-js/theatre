import TheatreJSProject, {
  TheatreJSProjectConf,
} from '$tl/facades/TheatreJSProject'
import projectsSingleton from '$tl/Project/projectsSingleton'
import {InvalidArgumentError} from '$tl/handy/errors'
import {$OnDiskState, OnDiskState} from '$tl/Project/store/types'
import {userFacingReoprter} from '$shared/ioTypes/userFacingReporter'
import userReadableTypeOfValue from '$shared/utils/userReadableTypeOfValue'
import {validateName} from './otherSanitizers'

export default function getProject(
  id: string,
  config: TheatreJSProjectConf = {},
): TheatreJSProject {
  const {...restOfConfig} = config
  if (projectsSingleton.has(id)) {
    return projectsSingleton.get(id)!.facade
  }

  if (!$env.tl.isCore) {
    validateName(id, 'projectName in Theatre.getProject(projectName)', true)
    validateProjectIdOrThrow(id)
  }

  if ($env.tl.isCore) {
    if (!config.state) {
      throw new InvalidArgumentError(
        `Argument config.state in Theatre.getProject("${id}", config) cannot be empty in theatre/core. Read more at https://docs.theatrejs.com/`,
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
      `Argument config.state in Theatre.getProject("${projectId}", config) is invalid. Lean how to fix this at https://docs.theatrejs.com`,
    )
    const errors = userFacingReoprter(validationResult)
    errors.forEach(e => console.log(e))
    console.groupEnd()

    throw new InvalidArgumentError(
      `Argument config.state in Theatre.getProject("${projectId}", config) is invalid. Lean how to fix this at https://docs.theatrejs.com`,
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
      )}, conf). The state seems to be formatted in a way that is unreadable to Theatre.js. Read more at https://docs.theatrejs.com`,
    )
  }
}

const validateProjectIdOrThrow = (id: string) => {
  if (typeof id !== 'string') {
    throw new InvalidArgumentError(
      `Argument 'name' in \`Theatre.getProject(name, ...)\` must be a string. Instead, it was ${userReadableTypeOfValue(
        id,
      )}.`,
    )
  }

  const idTrimmed = id.trim()
  if (idTrimmed.length !== id.length) {
    throw new InvalidArgumentError(
      `Argument 'name' in \`Theatre.getProject("${name}", ...)\` should not have surrounding whitespace.`,
    )
  }

  if (idTrimmed.length < 3) {
    throw new InvalidArgumentError(
      `Argument 'name' in \`Theatre.getProject("${name}", ...)\` should be at least 3 characters long.`,
    )
  }
}
