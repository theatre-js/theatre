import type {IScrub} from '@theatre/studio'
// Using the slightly larger threejs-math library instead of @math-gl
// because math-gl by default uses ZYX euler order, and some methods, notable fromQuaternion,
// don't allow you to specify a different order, which we need, because threejs defaults to XYZ.
import {Euler, Quaternion, Vector3} from 'threejs-math'
import type {API} from '.'
import {get} from 'lodash-es'

export function createRotationBinding({propName = 'rotation'} = {}) {
  let scrub: IScrub | null = null
  let existingRotation: Quaternion | null = null

  return {
    cross: (pressed: boolean, {orientation, object, studio}: API) => {
      const propValue = get(object.value, propName)

      if (!propValue) {
        console.warn(`Bindings: object has no ${propName} prop.`)
        return
      }
      if (pressed) {
        // "applies" the current orientation, so that it is treated as the "zero" orientation
        orientation.apply()
        scrub = studio.scrub()
        existingRotation = new Quaternion().setFromEuler(
          new Euler(propValue.x, propValue.y, propValue.z),
        )
      } else {
        if (scrub) {
          scrub.commit()
          scrub = null
        }
        existingRotation = null
      }
    },
    orientation(x: number, y: number, z: number, w: number, {object}: API) {
      if (!scrub || !existingRotation) return

      const propPointer = get(object.props, propName)

      scrub.capture((api) => {
        const rotation = new Euler().setFromQuaternion(
          new Quaternion(x, y, z, w).premultiply(existingRotation!),
        )

        api.set(propPointer, {
          x: rotation.x,
          y: rotation.y,
          z: rotation.z,
        })
      })
    },
  }
}

export type MovementPlane = 'xz' | 'xy' | 'yz'

export function createPositionBinding({
  propName = 'position',
  onStart: onActive = () => {},
  onEnd = () => {},
}: {
  propName?: string
  onStart?: (
    movementPlane: MovementPlane,
    originalPosition: [number, number, number],
  ) => void
  onEnd?: () => void
} = {}) {
  let existingPosition: Vector3 | null = null
  let movementPlane: MovementPlane | null = null
  let scrub: IScrub | null = null

  const createButtonHandler =
    (plane: MovementPlane) =>
    (pressed: boolean, {object, orientation, studio}: API) => {
      const propValue = get(object.value, propName)

      if (!propValue) {
        console.warn(`Bindings: object has no ${propName} prop.`)
        return
      }

      if (pressed) {
        onActive(plane, [propValue.x, propValue.y, propValue.z])

        movementPlane = plane
        // "applies" the current orientation, so that it is treated as the "zero" orientation
        orientation.apply()
        scrub = studio.scrub()
        existingPosition = new Vector3(propValue.x, propValue.y, propValue.z)
      } else {
        onEnd()

        if (scrub) {
          scrub.commit()
          scrub = null
        }
        existingPosition = null
        movementPlane = null
      }
    }

  return {
    square: createButtonHandler('xz'),
    triangle: createButtonHandler('xy'),
    circle: createButtonHandler('yz'),
    orientation(x: number, y: number, z: number, w: number, {object}: API) {
      if (!scrub || !existingPosition) return

      scrub.capture((api) => {
        if (!object.value.rotation) return

        const propPointer = get(object.props, propName)

        const euler = new Euler().setFromQuaternion(new Quaternion(x, y, z, w))

        if (movementPlane === 'xz') {
          api.set(propPointer, {
            x: existingPosition!.x - euler.y * 10,
            y: existingPosition!.y,
            z: existingPosition!.z - euler.x * 10,
          })
        }
        if (movementPlane === 'xy') {
          api.set(propPointer, {
            x: existingPosition!.x - euler.y * 10,
            y: existingPosition!.y + euler.x * 10,
            z: existingPosition!.z,
          })
        }
        if (movementPlane === 'yz') {
          api.set(propPointer, {
            x: existingPosition!.x,
            y: existingPosition!.y + euler.x * 10,
            z: existingPosition!.z + euler.y * 10,
          })
        }
      })
    },
  }
}
