import userReadableTypeOfValue from '$shared/utils/userReadableTypeOfValue'
import {NativeObjectType, NativeObjectTypeConfig} from '$tl/objects/objectTypes'
import {NativeObjectAdapter} from '$tl/nativeObjectAdapters/NativeObjectAdaptersManager'

const sanitizeAndValidateProps = (
  props: NativeObjectTypeConfig['props'],
  messageGenerator: MessageGenerator,
): NativeObjectTypeConfig['props'] => {
  if (!props || typeof props !== 'object') {
    console.warn(messageGenerator.propsIsntObject(props))
    return {}
  }

  const keys = Object.keys(props)
  if (keys.length === 0) {
    console.warn(messageGenerator.propsEmpty())
    return {}
  }

  const sanitisedProps: NativeObjectTypeConfig['props'] = {}

  for (let key of keys) {
    if (typeof key !== 'string') {
      console.warn(messageGenerator.propNameIsNotString(key))
      continue
    } else if (key.match(/[\.\-\/]+/)) {
      console.warn(messageGenerator.propNameHasIllegalCharacters(key))
      continue
    } else if (key.length > 32) {
      console.warn(messageGenerator.propNameHasWrongLength(key))
      continue
    }

    const propConfig = props[key]
    if (propConfig && typeof propConfig === 'object') {
      if (!propConfig.hasOwnProperty('type')) {
        console.warn(messageGenerator.propDoesntHaveAType(key))
        continue
      }
      if (typeof propConfig.type !== 'string') {
        console.warn(
          messageGenerator.propTypeIsNotAString(key, propConfig.type),
        )
        continue
      }
      if (propConfig.type !== 'number') {
        console.warn(messageGenerator.invalidPropTypeEnum(key, propConfig.type))
        continue
      }
      sanitisedProps[key] = propConfig
    } else {
      console.warn(messageGenerator.propConfigMustBeObject(key, propConfig))
    }
  }

  return sanitisedProps
}

export const sanitizeAndValidateHardCodedProps = (
  props: NativeObjectTypeConfig['props'],
  objectPath: string,
) =>
  sanitizeAndValidateProps(
    props,
    new MessageGeneratorForHardCodedProps(
      objectPath,
      `timeline.getObject("${objectPath}", ..., config)`,
    ),
  )

export const sanitizeAndValidateTypeFromAdapter = (
  type: NativeObjectType,
  adapter: NativeObjectAdapter,
): NativeObjectType => {
  const sanitizedType = {
    props: {},
  }

  if (!type || typeof type !== 'object') {
    console.warn(
      `Calling adapter.getType() on adapter "${
        adapter.name
      }" must return an object. Instead it returned ${userReadableTypeOfValue(
        type,
      )}.\n` +
        `To fix this, make sure the getType() method of this adapter returns a proper type, like:\n` +
        `\n` +
        `{\n` +
        `  props: {\n` +
        `    x: {\n` +
        `      type: 'number'\n` +
        `    }\n` +
        `  }\n` +
        `}`,
    )
    return sanitizedType
  }

  if (!type.hasOwnProperty('props')) {
    console.warn(
      `Calling adapter.getType() on adapter "${
        adapter.name
      }" returned an object without a 'props' property.\n` +
        `To fix this, make sure the getType() method of this adapter returns a proper type, like:\n` +
        `\n` +
        `{\n` +
        `  props: {\n` +
        `    x: {\n` +
        `      type: 'number'\n` +
        `    }\n` +
        `  }\n` +
        `}`,
    )
    return sanitizedType
  }

  sanitizedType.props = sanitizeAndValidateProps(
    type.props,
    new MessageGeneratorForAdapterReturnedProps(``, ``, adapter.name),
  )

  return sanitizedType
}

interface MessageGenerator {
  propsIsntObject(propsValue: mixed): string
  propsEmpty(): string
  propDoesntHaveAType(key: string): string
  propTypeIsNotAString(key: string, actualType: mixed): string
  invalidPropTypeEnum(key: string, actualType: string): string
  propConfigMustBeObject(key: string, config: mixed): string
  propNameIsNotString(key: unknown): string
  propNameHasIllegalCharacters(key: string): string
  propNameHasWrongLength(key: string): string
}

class MessageGeneratorForHardCodedProps implements MessageGenerator {
  constructor(
    readonly _objectPath: string,
    readonly _createObjectTemplate: string,
  ) {}

  protected _configToCreateObjectIsInvalid() {
    return `The config given to timeline.getObject("${
      this._objectPath
    }", ..., config) is invalid:\n`
  }

  protected _wellFormedConfigExample() {
    return (
      `const config = {\n` +
      `  props: {\n` +
      `    x: {\n` +
      `      type: 'number'\n` +
      `    }\n` +
      `  }\n` +
      `}`
    )
  }

  propsIsntObject(propsValue: mixed) {
    return (
      this._configToCreateObjectIsInvalid() +
      `The value config.props must be an object. Instead, it is ${userReadableTypeOfValue(
        propsValue,
      )}.\n` +
      `To fix this, you can either remove 'props' from config.props to allow an adapter to provide it, ` +
      `or write is as an object. Example:\n\n` +
      this._wellFormedConfigExample()
    )
  }
  propsEmpty() {
    return (
      this._configToCreateObjectIsInvalid() +
      `config.props is empty {}, so the object will have no properties for us to animate.\n` +
      `To fix this, you can add a prop by changing your config like this:\n\m` +
      this._wellFormedConfigExample()
    )
  }
  propDoesntHaveAType(key: string) {
    return (
      this._configToCreateObjectIsInvalid() +
      `config.props["${key}"] does not seem to have a 'type'.\n` +
      `To fix this, add a 'type' key to this prop. Here is an example of a valid prop type: {type: 'number'}`
    )
  }
  propTypeIsNotAString(key: string, actualType: mixed) {
    return (
      this._configToCreateObjectIsInvalid() +
      `Value config.props["${key}"].type must be a string. Instead, it was ${userReadableTypeOfValue(
        actualType,
      )}.\n` +
      `Here is an example of a valid prop type: {type: 'number'}`
    )
  }
  invalidPropTypeEnum(key: string, actualType: string) {
    return (
      this._configToCreateObjectIsInvalid() +
      `config.props["${key}"].type is "${actualType}", which is invalid. At the moment, only the 'number' prop type is supported.`
    )
  }
  propConfigMustBeObject(key: string, config: mixed) {
    return (
      this._configToCreateObjectIsInvalid() +
      `config.props["${key}"] must be an object. Instead, it is ${userReadableTypeOfValue(
        config,
      )}.\n` +
      `Example of a valid prop type: {type: 'number'}`
    )
  }
  propNameIsNotString(key: unknown) {
    return (
      this._configToCreateObjectIsInvalid() +
      `The name of props in config.props must be strings. ${userReadableTypeOfValue(
        key,
      )} was given.\n` +
      `Example of a valid prop name: {"Position X": {type: 'number'}}`
    )
  }
  propNameHasWrongLength(key: string) {
    return (
      this._configToCreateObjectIsInvalid() +
      `Prop "${key}" in config.props["${key}"] must have between 1 and 32 characters.\n` +
      `Example of a valid prop name: {"Position X": {type: 'number'}}`
    )
  }
  propNameHasIllegalCharacters(key: string) {
    return (
      this._configToCreateObjectIsInvalid() +
      `Prop "${key}" in config.props["${key}"] must not have dots (.), dashes (-), or slashes (/) in its name.\n` +
      `Example of a valid prop name: {"Position X": {type: 'number'}}`
    )
  }
}

class MessageGeneratorForAdapterReturnedProps implements MessageGenerator {
  constructor(
    readonly _objectPath: string,
    readonly _createObjectTemplate: string,
    readonly _adapterName: string,
  ) {}

  _wellFormattedExample() {
    return (
      `...\n` +
      `getType(...) {\n` +
      `  const config = {\n` +
      `    props: {\n` +
      `      x: {\n` +
      `        type: 'number'\n` +
      `      }\n` +
      `    }\n` +
      `  }\n` +
      `  return config\n` +
      `}\n` +
      `...`
    )
  }

  protected _configToCreateObjectIsInvalid() {
    return `Error in adater "${
      this._adapterName
    }". adapter.getType()' is returning an invalid value: \n`
  }

  propsIsntObject(propsValue: mixed) {
    return (
      this._configToCreateObjectIsInvalid() +
      `The value getType().props must be an object. Instead, it is ${userReadableTypeOfValue(
        propsValue,
      )}.\n` +
      `To fix this, make sure adapter.getType() returns an object. Example:\n\n` +
      this._wellFormattedExample()
    )
  }
  propsEmpty() {
    return (
      this._configToCreateObjectIsInvalid() +
      `adapter.getType(...).props is an empty, so we have no properties to animate.\n` +
      `To fix this, you can add a prop to your returned type, like this:\n` +
      this._wellFormattedExample()
    )
  }
  propDoesntHaveAType(key: string) {
    return (
      this._configToCreateObjectIsInvalid() +
      `adapter.getType(...).props["${key}"] does not seem to have a 'type' key.\n` +
      `To fix this, add a 'type' key to this prop. Here is an example of a valid prop type:\n` +
      `{type: 'number'}`
    )
  }
  propTypeIsNotAString(key: string, actualType: mixed) {
    return (
      this._configToCreateObjectIsInvalid() +
      `adapter.getType(...).props["${key}"].type must be a string. Instead, it was ${userReadableTypeOfValue(
        actualType,
      )}.\n` +
      `Here is an example of a valid prop type: {type: 'number'}`
    )
  }
  invalidPropTypeEnum(key: string, actualType: string) {
    return (
      this._configToCreateObjectIsInvalid() +
      `adapter.getType(...).props["${key}"].type is "${actualType}", which is invalid.\n` +
      `At the moment, only the 'number' prop type is supported.`
    )
  }
  propConfigMustBeObject(key: string, config: mixed) {
    return (
      this._configToCreateObjectIsInvalid() +
      `adapter.getType(...).props["${key}"] must be an object. Instead, it is ${userReadableTypeOfValue(
        config,
      )}.\n` +
      `Example of a valid prop type: {type: 'number'}`
    )
  }
  propNameIsNotString(key: unknown) {
    return (
      this._configToCreateObjectIsInvalid() +
      `The name of props in adapter.getType(...).props must be strings. ${userReadableTypeOfValue(
        key,
      )} was given.\n` +
      `Example of a valid prop name: {"Position X": {type: 'number'}}`
    )
  }
  propNameHasWrongLength(key: string) {
    return (
      this._configToCreateObjectIsInvalid() +
      `Prop "${key}" in adapter.getType(...).props["${key}"] must have between 1 and 32 characters.\n` +
      `Example of a valid prop name: {"Position X": {type: 'number'}}`
    )
  }
  propNameHasIllegalCharacters(key: string) {
    return (
      this._configToCreateObjectIsInvalid() +
      `Prop "${key}" in adapter.getType(...).props["${key}"] must not have dots (.), dashes (-), or slashes (/) in its name.\n` +
      `Example of a valid prop name: {"Position X": {type: 'number'}}`
    )
  }
}
