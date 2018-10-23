import setupScene from './setupScene'
import * as THREE from 'three'
import state from './data.json'

import {TypeOfTheatre} from '$src/tl/entries/index'

declare var Theatre: TypeOfTheatre

const {sphere, sphereGroup} = setupScene()

const project = new Theatre.Project('The ORB2', {state})

project.adapters.add({
  name: 'THREE.js Object Adapter',
  canHandle(obj) {
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
        squish: {
          type: 'number',
        },
        // scaleX: {
        //   type: 'number',
        // },
        // scaleY: {
        //   type: 'number',
        // },
        // scaleZ: {
        //   type: 'number',
        // },
      },
    }
  },
  start(object) {
    const nativeObject = object.nativeObject
    const stop = object.onValuesChange(values => {
      nativeObject.position.x = values.positionX
      nativeObject.position.y = values.positionY - 84
      nativeObject.position.z = values.positionZ
      nativeObject.scale.x = 1 - values.squish
      nativeObject.scale.y = 1 + values.squish
      nativeObject.scale.z = 1 - values.squish
      // nativeObject.ax
    })

    return stop
  },
})

const timeline = project.getTimeline('Bouncing orb')
// timeline.createObject('Ball', null)
timeline.createObject('Ball', sphereGroup)

project.adapters.add({
  name: 'blah',
  canHandle(s) {
    return s === obju
  },
  getType(o) {
    return {
      props: {},
    }
  },
  start() {
    return () => {}
  },
})

const obju = {}

// timeline.createObject('B2', obju)
// sphereGroup.position.z = 852
// sphere.position.y = -
// timeline.time = 2000

project.ready.then(async () => {
  // console.log('play')

  // timeline.play({
  //   iterationCount: 1000,
  //   // range: {from: 200, to: 1300}
  // })
  // timeline.gotoTime(1000)
})
