import setupScene from './setupScene'
import * as THREE from 'three'
import state from './data.json'

import {TypeOfTheatre} from '$src/tl/entries/index'

declare var Theatre: TypeOfTheatre

const {sphere, sphereGroup} = setupScene()

const project = Theatre.getProject('The ORB2', {state})

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
timeline.getObject('Ball', sphereGroup)

// timeline.createObject('B2', obju)
// sphereGroup.position.z = 852
// sphere.position.y = -
// timeline.time = 2000

project.ready.then(async () => {
  timeline.play({
    iterationCount: Infinity,
  })

  // timeline.time = 1000
  // console.log('play')

  // timeline.play({
  //   iterationCount: 1000,
  //   // range: {from: 200, to: 1300}
  // })
  // timeline.gotoTime(1000)
})

// const ratioIndicator = document.createElement('div')
// ratioIndicator.style = `
//   position: absolute;
//   top: 0;
//   left: 0;
// `
// document.body.appendChild(ratioIndicator)

// window.addEventListener('resize', () => {
//   const ratio = window.innerWidth / window.innerHeight
//   const wantedRatio = 16 / 9
//   const diff = ratio - wantedRatio
//   ratioIndicator.innerHTML = '' + diff + '<br>' + window.innerWidth + '<br>' + window.innerHeight
// })
