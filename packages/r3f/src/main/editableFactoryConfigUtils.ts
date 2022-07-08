import type {UnknownShorthandCompoundProps} from '@theatre/core'
import {types} from '@theatre/core'
import type {Object3D} from 'three'
import {Color} from 'three'
import type {IconID} from './IconID'

export type Helper = Object3D & {
  update?: () => void
}
type PropConfig<T> = {
  parse: (props: Record<string, any>) => T
  apply: (value: T, object: any) => void
  type: UnknownShorthandCompoundProps
}
type Props = Record<string, PropConfig<any>>
type Meta<T> = {
  useTransformControls: boolean
  updateObject?: (object: T) => void
  icon: IconID
  dimensionless?: boolean
  createHelper?: (object: T) => Helper
}
export type ObjectConfig<T> = {props: Props} & Meta<T>
export type EditableFactoryConfig = Partial<
  Record<keyof JSX.IntrinsicElements, ObjectConfig<any>>
>

type Vector3 = {
  x: number
  y: number
  z: number
}

function isNumber(value: any) {
  return typeof value === 'number' && isFinite(value)
}

function isVectorObject(value: any) {
  return (['x', 'y', 'z'] as const).every((axis) => isNumber(value[axis]))
}

export const createVector = (components?: [number, number, number]) => {
  return components
    ? {x: components[0], y: components[1], z: components[2]}
    : {
        x: 0,
        y: 0,
        z: 0,
      }
}

export const createVectorPropConfig = (
  key: string,
  defaultValue = createVector(),
  {nudgeMultiplier = 0.01} = {},
): PropConfig<Vector3> => ({
  parse: (props) => {
    const propValue = props[key]
    // if prop exists
    const vector = !propValue
      ? defaultValue
      : // if prop is an array
      Array.isArray(propValue)
      ? createVector(propValue as any)
      : // if prop is a scalar
      isNumber(propValue)
      ? {
          x: propValue,
          y: propValue,
          z: propValue,
        }
      : // if prop is a threejs Vector3
      isVectorObject(propValue)
      ? {
          x: propValue.x,
          y: propValue.y,
          z: propValue.z,
        }
      : // show a warning and return defaultValue
        (console.warn(
          `Couldn't parse prop %c${key}={${JSON.stringify(
            propValue,
          )}}%c, falling back to default value.`,
          'background: black; color: white',
        ),
        defaultValue)
    ;(['x', 'y', 'z'] as const).forEach((axis) => {
      // e.g. r3f also accepts prop keys like "scale-x"
      if (props[`${key}-${axis}` as any])
        vector[axis] = props[`${key}-${axis}` as any]
    })
    return vector
  },
  apply: (value, object) => {
    object[key].set(value.x, value.y, value.z)
  },
  type: {
    [key]: {
      x: types.number(defaultValue.x, {nudgeMultiplier}),
      y: types.number(defaultValue.y, {nudgeMultiplier}),
      z: types.number(defaultValue.z, {nudgeMultiplier}),
    },
  },
})

export const createNumberPropConfig = (
  key: string,
  defaultValue: number = 0,
  {nudgeMultiplier = 0.01} = {},
): PropConfig<number> => ({
  parse: (props) => {
    return props[key] ?? defaultValue
  },
  apply: (value, object) => {
    object[key] = value
  },
  type: {
    [key]: types.number(defaultValue, {nudgeMultiplier}),
  },
})

export type Rgba = {
  r: number
  g: number
  b: number
  a: number
}

export const createColorPropConfig = (
  key: string,
  defaultValue = new Color(0, 0, 0),
): PropConfig<Rgba> => ({
  parse: (props) => {
    return {...(props[key] ?? defaultValue), a: 1}
  },
  apply: (value, object) => {
    object[key].setRGB(value.r, value.g, value.b)
  },
  type: {
    [key]: types.rgba({...defaultValue, a: 1}),
  },
})

export const extendObjectProps = <T extends {props: {}}>(
  objectConfig: T,
  extension: Props,
) => ({
  ...objectConfig,
  props: {...objectConfig.props, ...extension},
})
