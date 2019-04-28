import NativeObjectAdaptersManager, {
  AdapterPriority,
  NativeObjectAdapter,
} from '$tl/nativeObjectAdapters/NativeObjectAdaptersManager'
import {InvalidArgumentError} from '$tl/handy/errors'
import {isInteger} from 'lodash-es'
import userReadableTypeOfValue from '$shared/utils/userReadableTypeOfValue'

const theWeakmap = new WeakMap<
  TheatreAdaptersManager,
  NativeObjectAdaptersManager
>()
const realInstance = (s: TheatreAdaptersManager) =>
  theWeakmap.get(s) as NativeObjectAdaptersManager

export default class TheatreAdaptersManager {
  constructor(adapters: NativeObjectAdaptersManager) {
    theWeakmap.set(this, adapters)
  }

  add(adapter: NativeObjectAdapter, priority: AdapterPriority = 5) {
    const inst = realInstance(this)
    if (!$env.tl.isCore) {
      if (
        typeof priority !== 'number' ||
        !isInteger(priority) ||
        priority < 0 ||
        priority > 10
      ) {
        throw new InvalidArgumentError(
          `The priority argument to adapters.add(..., priority) must be an interger between 1 and 10. ${userReadableTypeOfValue(
            priority,
          )} given.`,
        )
      }
    }
    const adapters = inst._adaptersByPriority[priority]
    if (!$env.tl.isCore && !adapters) {
      throw new InvalidArgumentError(
        `The priority argument to adapters.add(..., priority) must be an interger between 1 and 10. ${userReadableTypeOfValue(
          priority,
        )}`,
      )
    }

    const sanitizedAdapter = $env.tl.isCore
      ? adapter
      : sanitizeAdapter(adapter, inst)
    inst.add(sanitizedAdapter, priority)
  }
}

const sanitizeAdapter = (
  adapter: NativeObjectAdapter,
  manager: NativeObjectAdaptersManager,
): NativeObjectAdapter => {
  if (!adapter || typeof adapter !== 'object') {
    throw new InvalidArgumentError(
      `Argument adapter in project.adapters.add(adapter) must be an object. ` +
        `Instead, it is ${userReadableTypeOfValue(
          adapter,
        )}. Learn more about writing adapters at https://theatrejs.com/docs/adapters.html`,
    )
  }
  const sanitizedAdapter = {...adapter}
  if (!adapter.hasOwnProperty('name')) {
    throw new InvalidArgumentError(
      `Argument adapter in project.adapters.add(adapter) does not seem to have a name. ` +
        `Pick a unique name for this adapter like: {name: "HTMLAdapter"} ` +
        `Learn more about writing adapters at https://theatrejs.com/docs/adapters.html`,
    )
  }
  if (typeof adapter.name !== 'string') {
    throw new InvalidArgumentError(
      `adapter.name in project.adapters.add(adapter) must be a string. Instead, it's ${userReadableTypeOfValue(
        adapter.name,
      )}. ` +
        `Pick a unique name for this adapter like: {name: "HTMLAdapter"} ` +
        `Learn more about writing adapters at https://theatrejs.com/docs/adapters.html`,
    )
  }
  if (manager.getAdapterByName(adapter.name)) {
    throw new InvalidArgumentError(
      `An adapter by the name "${
        adapter.name
      }" has already been added to this project. ` +
        `Each adapter must have a unique name.\n` +
        `Learn more about writing adapters at https://theatrejs.com/docs/adapters.html`,
    )
  }
  const name = adapter.name
  const nameTrimmed = name.trim()
  if (nameTrimmed.length !== name.length) {
    throw new InvalidArgumentError(
      `The name of adpater "${name}" should not have surrounding whitespace.`,
    )
  }

  if (nameTrimmed.length < 3) {
    throw new InvalidArgumentError(
      `The name of adpater "${name}" should be at least 3 characters long.`,
    )
  }

  if (!adapter.hasOwnProperty('getConfig')) {
    throw new InvalidArgumentError(
      `Adapter "${
        adapter.name
      }" does not seem to have a getConfig() method.\n` +
        `To fix this, implement a getConfig() method that takes a native object ` +
        `and returns the config of that object. Example:\n` +
        exampleGoodAdapter +
        `\n\n` +
        `Learn more about writing adapters at https://theatrejs.com/docs/adapters.html`,
    )
  }

  if (typeof adapter.getConfig !== 'function') {
    throw new InvalidArgumentError(
      `The getConfig() property of adapter "${
        adapter.name
      }" is not a function.\n` +
        `To fix this, implement the getConfig() property as a function that takes a native object ` +
        `and returns the config of that object. Example:\n` +
        exampleGoodAdapter +
        `\n\n` +
        `Learn more about writing adapters at https://theatrejs.com/docs/adapters.html`,
    )
  }

  if (!adapter.hasOwnProperty('canHandle')) {
    throw new InvalidArgumentError(
      `Adapter "${
        adapter.name
      }" does not seem to have a canHandle() method.\n` +
        `To fix this, implement a canHandle() method that takes a native object ` +
        `and returns a true if it can handle such an object or false if it cannot. Example:\n` +
        exampleGoodAdapter +
        `\n\n` +
        `Learn more about writing adapters at https://theatrejs.com/docs/adapters.html`,
    )
  }

  if (typeof adapter.canHandle !== 'function') {
    throw new InvalidArgumentError(
      `The canHandle() property of adapter "${
        adapter.name
      }" is not a function.\n` +
        `To fix this, implement the canHandle() property as a function that takes a native object ` +
        `and returns a true if it can handle such an object or false if it cannot. Example:\n` +
        exampleGoodAdapter +
        `\n\n` +
        `Learn more about writing adapters at https://theatrejs.com/docs/adapters.html`,
    )
  }

  if (!adapter.hasOwnProperty('start')) {
    sanitizedAdapter.start = () => () => {}
    console.warn(
      `Adapter "${adapter.name}" does not seem to have a start() method.\n` +
        `To fix this, implement a start() method that would read prop values from ` +
        `the Theatre object and apply it to the native Object. ` +
        `Example:\n` +
        exampleGoodAdapter +
        `\n\n` +
        `Learn more about writing adapters at https://theatrejs.com/docs/adapters.html`,
    )
  } else if (typeof adapter.start !== 'function') {
    sanitizedAdapter.start = () => () => {}
    console.warn(
      `The start() property of adapter "${adapter.name}" is not a function.\n` +
        `To fix this, implement a start() method that would read prop values from ` +
        `the Theatre object and apply it to the native Object. ` +
        `Example:\n` +
        exampleGoodAdapter +
        `\n\n` +
        `Learn more about writing adapters at https://theatrejs.com/docs/adapters.html`,
    )
  }

  return sanitizedAdapter
}

export const warningForWhenAdapterDotStartDoesntReturnFunction = (
  adapter: NativeObjectAdapter,
) => {
  return (
    `The start() property of adapter "${
      adapter.name
    }" was called, but it did not return a stop function.\n` +
    `The stop function is needed when we need to remove the object from the page and reclaim resources.\n` +
    `To fix this, implement a stop() function would free up all resources that were claimed when the start() method was called.\n\n` +
    `Example:\n` +
    exampleGoodAdapter +
    `\n\n` +
    `Learn more about writing adapters at https://theatrejs.com/docs/adapters.html`
  )
}

const exampleGoodAdapter = `
const adapter = {
  name: 'MyHTMLAdapter',
  canHandle(nativeObject) {
    return nativeObject instanceof HTMLElement
  },
  getConfig(nativeObject) {
    return {
      props: {
        positionX: {
          type: 'number'
        },
        positionY: {
          type: 'number'
        }
      }
    }
  },
  start(object) {
    const nativeObject = object.nativeObject
    const unsubscribeFromValueChanges = theatreObject.onValuesChange((newValues) => {
      nativeObject.position.left = newValues.positionX + 'px'
      nativeObject.position.top = newValues.positionY + 'px'
    })

    cosnt stop = unsubscribeFromValueChanges
    return stop
  }
}

project.adapters.add(adapter)
`
