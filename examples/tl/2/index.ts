import setupScene from './setupScene'
import * as THREE from 'three'
import state from './data.json'

import {TypeOfTheatre} from '$src/tl/entries/index'

declare var Theatre: TypeOfTheatre

const {sphere, sphereGroup} = setupScene()

const project = Theatre.getProject('The ORB2', {state})
// Theatre.getProject('The ORB 3', {state})

project.adapters.add({
  name: 'THREE.js Object Adapter',
  canHandle(obj) {
    return obj instanceof THREE.Object3D
  },
  getConfig(obj: THREE.Object3D) {
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
        stretch: {
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
      nativeObject.scale.y = values.stretch
      nativeObject.scale.x = 1 / values.stretch
      nativeObject.scale.z = 1 / values.stretch
      // nativeObject.scale.z = values.stretch
      // nativeObject.ax
    })

    return stop
  },
})

const timeline = project.getTimeline('Bounce')
// project.getTimeline('Fave')
// project.getTimeline('Fave', '1')
// project.getTimeline('Fave', '2')
// project.getTimeline('Warped Transition')
// project.getTimeline('Buttons / Upvote Button')
// project.getTimeline('Buttons / Downvote Button')
// project.getTimeline('Buttons / Save Button')
// project.getTimeline('Intro / Loading Sequence')
// project.getTimeline('Intro / Initial Reveal')
// timeline.createObject('Ball', null)
timeline.getObject('The box', sphereGroup)

// const object = timeline.getObject(
//   // name of our object
//   "The box",
//   // a reference to the native object
//   nativeObject,
//   // the object's configuration:
//   {
//     // the object's props:
//     props: {
//       // we're defining prop "y",
//       y: {
//         // ... which is of type "number"
//         type: 'number'
//       }
//     }
//   }
// )

// timeline.createObject('B2', obju)
// sphereGroup.position.z = 852
// sphere.position.y = -
// timeline.time = 2000

project.ready.then(async () => {
  // timeline.play({
  //   iterationCount: Infinity,
  // })
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

// const context = document.getElementById('the-canvas').getContext('2d')

// class Circle {
//   constructor(x, y, radius) {
//     this.x = x
//     this.y = y
//     this.radius = radius
//   }

//   setCoords(x, y) {
//     this.x = x
//     this.y = y
//   }

//   setRadius(radius) {
//     this.radius = radius
//   }

//   draw(context) {
//     ctx.beginPath()
//     ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true)
//     ctx.closePath()
//     ctx.fill()
//   }
// }

// const circle1 = timeline.getObject("Circle 1", new Circle(0, 0, 0), {
//   props: {
//     x: {type: 'number'},
//     y: {type: 'number'},
//     radius: {type: 'number'},
//   }
// })

// circle1.onValuesChange((values) => {
//   circle1.nativeObject.setCoords(values.x, values.y)
//   circle1.nativeObject.setRadius(values.radius)
//   circle1.nativeObject.draw(context)
// })

// const circle2 = timeline.getObject("Circle 1", new Circle(0, 0, 0), {
//   props: {
//     x: {type: 'number'},
//     y: {type: 'number'},
//     radius: {type: 'number'},
//   }
// })

// circle2.onValuesChange((values) => {
//   circle1.nativeObject.setCoords(values.x, values.y)
//   circle1.nativeObject.setRadius(values.radius)
//   circle1.nativeObject.draw(context)
// })

// const circleAdapter = {
//   // name may be any string, unique withing the Project
//   name: 'Circle',

//   // this function returns true if the native object can be handled by this adapter.
//   canHandle(nativeObject) {
//     // in this case, we only return true for nativeObjects that are an instance of Circle.
//     // this means that other native objects will not be handled by this Adapter
//     return nativeObject instanceof Circle
//   },

//   //
//   getType() {

//   }
// }
