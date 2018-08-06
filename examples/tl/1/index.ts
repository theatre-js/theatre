// import setupScene from './setupScene'
// import {TLType} from '../../../src/tl/index'
import {TypeOfTL} from '$src/tl/index'
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
project.getTimeline('Bouncing Ball/ The ball', '1')
project.getTimeline('Bouncing Ball / The ball', '2')
project.getTimeline('Bouncing Ball X')

const timeline = project.getTimeline('Bouncing Ball / The ball')
const ball = timeline.createObject('The ball')
