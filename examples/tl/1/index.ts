import setupScene from './setupScene'
import * as THREE from 'three'

// import {TLType} from '../../../src/tl/index'
import {TypeOfTL} from '$src/tl/index'
import {NativeObjectType} from '$tl/objects/objectTypes'
import {VoidFn} from '$shared/types'
// const {sphere} = setupScene()
// import TL from 'theaterjs'
// import 'theaterjs/ui'

// function setupTheaterForSphere(mesh) {
//   const obj = timeline.getObject('The Ball', mesh, {
//     props: {
//       opacity: {
//         type: Theater.types.number({limit: {from: 0, to: 1}}),
//         default: 1,
//       },
//     },
//   })
// }

// TL.ui.propertyEditors.add({
//   traitName: 'Position2D',
//   render(data) {
//     return <div />
//   }
// })

// declare var TL: TLType
declare var TL: TypeOfTL

TL.ui.enable()

// new TL.Project('Intro Post')
// new TL.Project('Mathly Preview')

// const state = {
//   versionId: 'sdlkfjsldfjoejsldkoeijsldksd'
// }

// const project = new TL.Project('Explorable Explanations')
// project.getTimeline('Bouncing Ball / The ball', '1')
// project.getTimeline('Bouncing Ball / The ball', '2')
// project.getTimeline('Bouncing Ball X')
// project.getTimeline('Scene / Background / X / Y')
// project.getTimeline('Scene / Background')
// project.getTimeline('Scene / Foo / Foo')
// project.getTimeline('Scene / Foo / Bar')
// project.getTimeline('Scene / Foo / Baz')
// project.getTimeline('Scene / Foo / Bam')
// project.getTimeline('Scene / Bar')
// project.getTimeline('Scene / Baz')
// project.getTimeline('Scene / Demo / Cursor')
// project.getTimeline('Scene / Demo / Grids')
// project.getTimeline('Scene / Panels / Layers')
// project.getTimeline('Scene / Panels / Tools')

// project.adapters.add(1, {
//   accepts(nativeObject) {
//     return nativeObject instanceof HTMLElement
//   },

//   getType(nativeObject: HTMLElement): NativeObjectType {
//     return {
//       props: {
//         // position: {
//         //   type: 'position3d',
//         // },
//         // opacity: {
//         //   type: 'number',
//         // },
//         'position.x': {
//           type: 'number',
//         },
//         // 'position.y': {
//         //   type: 'number',
//         // },
//         // 'position.z': {
//         //   type: 'number',
//         // },
//       },
//     }
//   },

//   start(obj, nativeObject: HTMLElement): VoidFn {
//     // console.log('vv', nativeOb``);

//     const stopListening = obj.onValuesChange((values, t) => {
//       // console.log(nativeObject);
//       // console.log(obj.path, t, values.opacity)

//       nativeObject.style.opacity = String(values.opacity)
//       nativeObject.style.transform = `translateX(${String(
//         values['position.x'],
//       )}px)`
//     })

//     const cleanup = () => {
//       stopListening()
//       nativeObject.style.opacity = '1'
//     }

//     return cleanup
//   },
// })

// const timeline = project.getTimeline('Bouncing Ball / The ball')
// const ballInDom = document.createElement('div')
// document.body.appendChild(ballInDom)
// ballInDom.style.cssText = `
//   position: absolute; width: 50px;
//   height: 50px; left: calc(50% - 25px);
//   top: 10%; border-radius: 50%;
//   border: 3px solid rgba(255, 255, 255, 0.5);`

// ballInDom.classList.add('ball')
// const ball = timeline.createObject('Act 1 / Stage / Ball', ballInDom)
// timeline.play({rate: -1})

// timeline.createObject(
//   'Act 1 / Stage / Ball / The dangling thing',
//   document.createElement('div'),
// )
// timeline.createObject('Act 1 / Stage / Plane', document.createElement('div'))

// timeline.createObject(
//   'Act 1 / Helpers / FPS Counter',
//   document.createElement('div'),
// )

// timeline.createObject('Act 2 / Recess / Title', document.createElement('div'))

// timeline.createObject('Act 2 / Recess / Music', document.createElement('div'))

const {sphere} = setupScene()

const project = new TL.Project('The ORB')

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
      },
    }
  },
  start(object, nativeObject: THREE.Object3D) {
    const stop = object.onValuesChange((values) => {
      nativeObject.position.x = values.positionX
      nativeObject.position.y = values.positionY
      nativeObject.position.z = values.positionZ
    })

    return stop
  },
})

const timeline = project.getTimeline('Bouncing orb')
timeline.createObject('Ball', sphere)

// timeline.play()
timeline.time = 2000
// setTimeout(() => {
//   timeline.play({rate: 2, range: {from: 0, to: 2000}, iterationCount: 5, direction: 'alternate'})
// }, 100)

// sphere.position.x = 100