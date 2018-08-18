// import setupScene from './setupScene'
// import {TLType} from '../../../src/tl/index'
import {TypeOfTL} from '$src/tl/index'
import {NativeObjectType} from '$tl/objects/objectTypes'
// const {sphere} = setupScene()

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

new TL.Project('Intro Post')
new TL.Project('Mathly Preview')

const project = new TL.Project('Explorable Explanations')
project.getTimeline('Bouncing Ball / The ball', '1')
project.getTimeline('Bouncing Ball / The ball', '2')
project.getTimeline('Bouncing Ball X')
project.getTimeline('Scene / Background / X / Y')
project.getTimeline('Scene / Background')
project.getTimeline('Scene / Foo / Foo')
project.getTimeline('Scene / Foo / Bar')
project.getTimeline('Scene / Foo / Baz')
project.getTimeline('Scene / Foo / Bam')
project.getTimeline('Scene / Bar')
project.getTimeline('Scene / Baz')
project.getTimeline('Scene / Demo / Cursor')
project.getTimeline('Scene / Demo / Grids')
project.getTimeline('Scene / Panels / Layers')
project.getTimeline('Scene / Panels / Tools')


project.adapters.add(1, {
  accepts(nativeObject) {
    return nativeObject instanceof HTMLElement &&
      nativeObject.classList.contains('ball')
      ? true
      : false
  },

  getType(nativeObject: HTMLElement): NativeObjectType {
    return {
      props: {
        // position: {
        //   type: 'position3d',
        // },
        opacity: {
          type: 'number'
        }
      },
    }
  },
})

const timeline = project.getTimeline('Bouncing Ball / The ball')
const ballInDom = document.createElement('div')
document.body.appendChild(ballInDom)
ballInDom.style.cssText = `
  position: absolute; width: 50px; 
  height: 50px; left: calc(50% - 25px); 
  top: 10%; border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);`

ballInDom.classList.add('ball')
const ball = timeline.createObject('Act 1 / Stage / Ball', ballInDom)

timeline.createObject(
  'Act 1 / Stage / Ball / The dangling thing',
  document.createElement('div'),
)
timeline.createObject(
  'Act 1 / Stage / Plane',
  document.createElement('div'),
)

timeline.createObject(
  'Act 1 / Helpers / FPS Counter',
  document.createElement('div'),
)

timeline.createObject(
  'Act 2 / Recess / Title',
  document.createElement('div'),
)

timeline.createObject(
  'Act 2 / Recess / Music',
  document.createElement('div'),
)