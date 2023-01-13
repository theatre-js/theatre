import type {IScrub} from '@theatre/studio'
// Using the slightly larger threejs-math library instead of @math-gl
// because math-gl by default uses ZYX euler order, and some methods, notable fromQuaternion,
// don't allow you to specify a different order, which we need, because threejs defaults to XYZ.
import {Euler, Quaternion, Vector3} from 'threejs-math'
import type {API} from '.'
import {get} from 'lodash-es'

export function createRotationBinding({propName = 'rotation'} = {}) {
  let scrub: IScrub | null = null
  let initialRotation: Quaternion | null = null

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
        initialRotation = new Quaternion().setFromEuler(
          new Euler(propValue.x, propValue.y, propValue.z),
        )
      } else {
        if (scrub) {
          scrub.commit()
          scrub = null
        }
        initialRotation = null
      }
    },
    orientation(x: number, y: number, z: number, w: number, {object}: API) {
      if (!scrub || !initialRotation) return

      const propPointer = get(object.props, propName)

      scrub.capture((api) => {
        const rotation = new Euler().setFromQuaternion(
          new Quaternion(x, y, z, w).premultiply(initialRotation!),
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
    initialPosition: [number, number, number],
  ) => void
  onEnd?: () => void
} = {}) {
  let initialPosition: Vector3 | null = null
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
        initialPosition = new Vector3(propValue.x, propValue.y, propValue.z)
      } else {
        onEnd()

        if (scrub) {
          scrub.commit()
          scrub = null
        }
        initialPosition = null
        movementPlane = null
      }
    }

  return {
    square: createButtonHandler('xz'),
    triangle: createButtonHandler('xy'),
    circle: createButtonHandler('yz'),
    orientation(x: number, y: number, z: number, w: number, {object}: API) {
      if (!scrub || !initialPosition) return

      scrub.capture((api) => {
        if (!object.value.rotation) return

        const propPointer = get(object.props, propName)

        // calculate the controller's forward vector
        const vector = new Vector3(0, 0, -1).applyQuaternion(
          new Quaternion(x, y, z, w),
        )

        if (movementPlane === 'xz') {
          api.set(propPointer, {
            // Take the tangent of the angle between the forward vector and the orthogonal plane of the initial forward vector
            // by dividing the x and y components by the z component.
            // Limit the z component to at least 0.3 so that the position doesn't fly off the handle
            // when we divide by z (and to avoid NaN).
            // Below z = 0.3 the movement becomes too noisy anyway.
            // We then multiply by 6 to make the movement a bit more sensitive. This value is chosen as a balance between sensitivity and noise.
            // We then add the resulting components to the initial position to get the final position.
            x:
              initialPosition!.x +
              (vector.x / Math.max(Math.abs(vector.z), 0.3)) * 8,
            y: initialPosition!.y,
            z:
              initialPosition!.z +
              (vector.y / Math.max(Math.abs(vector.z), 0.3)) * 8,
          })
        }
        // Do the same for the other planes too
        if (movementPlane === 'xy') {
          api.set(propPointer, {
            x:
              initialPosition!.x +
              (vector.x / Math.max(Math.abs(vector.z), 0.3)) * 6,
            y:
              initialPosition!.y +
              (vector.y / Math.max(Math.abs(vector.z), 0.3)) * 6,
            z: initialPosition!.z,
          })
        }
        if (movementPlane === 'yz') {
          api.set(propPointer, {
            x: initialPosition!.x,
            y:
              initialPosition!.y +
              (vector.y / Math.max(Math.abs(vector.z), 0.3)) * 6,
            z:
              initialPosition!.z -
              (vector.x / Math.max(Math.abs(vector.z), 0.3)) * 6,
          })
        }
      })
    },
  }
}
