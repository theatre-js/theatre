import setupScene from './setupScene'
import * as THREE from 'three'

import {TypeOfTheatre} from '$src/tl/entries/index'

declare var Theatre: TypeOfTheatre

const {sphere, sphereGroup} = setupScene()

const project = new Theatre.Project('The ORB')

project.adapters.add(2, {
  accepts(obj) {
    return obj instanceof THREE.Object3D
  },
  getType(obj: THREE.Object3D) {
    return {
      props: {
        positionX: {
          type: 'number',
        },
        positionY: {
          type: 'number',
        },
        positionZ: {
          type: 'number',
        },
        scaleX: {
          type: 'number',
        },
        scaleY: {
          type: 'number',
        },
        scaleZ: {
          type: 'number',
        },
      },
    }
  },
  start(object, nativeObject: THREE.Object3D) {
    const stop = object.onValuesChange((values) => {
      nativeObject.position.x = values.positionX
      nativeObject.position.y = values.positionY
      nativeObject.position.z = values.positionZ
      nativeObject.scale.x = values.scaleX
      nativeObject.scale.y = values.scaleY
      nativeObject.scale.z = values.scaleZ
      // nativeObject.ax
    })

    return stop
  },
})

const timeline = project.getTimeline('Bouncing orb')
timeline.createObject('Ball', sphereGroup)
// sphereGroup.position.z = 852
// sphere.position.y = -
// timeline.time = 2000

// timeline.play()
// setTimeout(() => {
//   timeline.play({range: {from: 400, to: 3300}, iterationCount: Infinity, direction: 'alternate'})
// }, 500)

// sphere.position.x = 100