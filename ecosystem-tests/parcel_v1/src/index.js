import {getProject} from '@theatre/core'
import studio from '@theatre/studio'
import state from './state.json'
// Place your mouse over the Theatre.js studio menu
// in the top left of the white browser page and click
// "Example Object" to open the object editor and
// animation editor. Press space to play the animation
// and edit it by moving the playhead then
// changing the props in the object editor.
studio.initialize()

// Load a simple Theatre.js project from ./state.json
const project = getProject('Hello World', {state})
const sheet = project.sheet('Example Scene')

// Create a simple Theatre.js object with an x and y
const objValues = {x: 50, y: 60}
const obj = sheet.object('Example Object', objValues)

// Create a div to animate
const div = document.createElement('div')
div.style.height = '50px'
div.style.width = '50px'
div.style.background = 'LightSeaGreen'
document.body.append(div)

// Reposition the div whenever the Theatre.js object changes
// CSS transform reference: https://developer.mozilla.org/en-US/docs/Web/CSS/transform
obj.onValuesChange(
  (vals) => (div.style.transform = `translate(${vals.x}px, ${vals.y}px)`),
)
