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

        /*
        Calculating the position involves mapping the orientation to a point on a plane. This can be done using different
        trigonometric methods.

        Things to consider:
        - We need to balance the speed of movement with the precision of the movement.
        - We need to balance the speed of movement with the sensor noise. Larger coefficients will make the
          movement noisier.
        
        Here are some methods and their caveats:
        - Take the cotangent of the orientation with respect to a plane
          This is the method preferred here, since it allows for precise, slower movements at small orientation changes,
          while allowing for fast movements at the extremes. This method also fits best the the laser pointer metaphor (see below).
        - Take the cosine of the orientation with respect to a plane
          The movement slows down towards the extremes, which is less useful than the tangent method described above.
        - Map the orientation to a triangle wave with respect to a plane
          This results in linear movement, which fits the trackball metaphor (see below).

          const xTranslationLinear = ((2 * a) / Math.PI) * Math.asin(vector.x)
          const yTranslationLinear = a - ((2 * a) / Math.PI) * Math.acos(vector.y)

        There are also different metaphors we can consider in the implementation:
        - Laser pointer
          The controller is a laser pointer, projecting a point onto a flat surface. In this metaphor, the roll
          of the controller is ignored, since it doesn't change the direction of the laser pointer. Orientation maps
          tangentially to movement. At the extremes, movement becomes faster per orientation change.
        - Trackball
          The controller is a trackball. Changes in roll results in movement along the x axis,
          changes in pitch results in changes in the y axis. The yaw of the controller is ignored, since a
          trackpall can't be yawed. Orientation maps lineraly to movement.

          const upVector = new Vector3(0, 1, 0).applyQuaternion(new Quaternion(x, y, z, w))
          const xTranslationTrackball = (upVector.x / Math.max(Math.abs(upVector.y), 0.3)) * 6

          It could be tempting to combine the two metaphors, but this can result in a confusing experience,
          since the roll or the yaw of the controller can easily be changed inadvertently, which makes it difficult to
          determine the user's intent.

          This implementation uses the laser pointer metaphor with the tangent method.
        */

        // calculate the controller's forward vector
        const forwardVector = new Vector3(0, 0, -1).applyQuaternion(
          new Quaternion(x, y, z, w),
        )

        // Take the tangent of the angle between the forward vector and the orthogonal plane of the initial forward vector
        // by dividing the x and y components by the z component.
        // Limit the z component to at least 0.3 so that the position doesn't fly off the handle
        // when we divide by z (and to avoid NaN).
        // Below z = 0.3 the movement becomes too noisy anyway.
        // We then multiply by 6 to make the movement a bit more sensitive. This value is chosen as a balance between sensitivity and noise.
        const xTranslation =
          (forwardVector.x / Math.max(Math.abs(forwardVector.z), 0.3)) * 6
        const yTranslation =
          (forwardVector.y / Math.max(Math.abs(forwardVector.z), 0.3)) * 6

        if (movementPlane === 'xz') {
          api.set(propPointer, {
            x: initialPosition!.x + xTranslation,
            y: initialPosition!.y,
            z: initialPosition!.z + yTranslation,
          })
        }
        if (movementPlane === 'xy') {
          api.set(propPointer, {
            x: initialPosition!.x + xTranslation,
            y: initialPosition!.y + yTranslation,
            z: initialPosition!.z,
          })
        }
        if (movementPlane === 'yz') {
          api.set(propPointer, {
            x: initialPosition!.x,
            y: initialPosition!.y + yTranslation,
            z: initialPosition!.z - xTranslation,
          })
        }
      })
    },
  }
}
