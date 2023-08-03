import studio from '@theatre/studio'
import {getProject, types} from '@theatre/core'
import state from './reading obj value.theatre-project-state.json'
studio.initialize({usePersistentStorage: false})

const project = getProject('reading obj value', {state})
const TOTAL_ELEMENTS = 300
const TOTAL_ELEMENTS_R = 1 / TOTAL_ELEMENTS
const playbackControlObj = project
  .sheet('controls sheet')
  .object('playback control', {
    interval: types.number(50, {
      range: [1, 20000],
    }),
  })
const elements = new Array(TOTAL_ELEMENTS).fill(0).map((_, idx) => {
  const sheet = project.sheet('sample sheet', `#${idx}`)
  const obj = sheet.object('sample object', {
    position: {
      x: 0,
      y: 0,
    },
  })

  const el = document.createElement('div')

  Object.assign(el.style, {
    position: 'absolute',
    height: '2rem',
    width: '2rem',
    borderRadius: '50%',
    background: `hsl(${idx * 360 * TOTAL_ELEMENTS_R}, 100%, 80%)`,
    left: 'var(--x)',
    top: 'var(--y)',
  })

  document.body.appendChild(el)

  return {el, sheet, obj}
})

void project.ready.then(() => {
  // select the playback controls obj so it shows as a tweakable control
  studio.setSelection([playbackControlObj])
  for (let i = 0; i < elements.length; i++) {
    const sheet = elements[i].sheet
    sheet.sequence.position = i * TOTAL_ELEMENTS_R * 5
    void sheet.sequence.play({
      iterationCount: Infinity,
    })
  }
})

function render() {
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    // read directly from value to test keepHot from https://linear.app/theatre/issue/P-217/if-objvalue-is-read-make-sure-its-derivation-remains-hot-for-a-while
    const value = element.obj.value
    element.el.style.setProperty('--x', value.position.x + 'px')
    element.el.style.setProperty('--y', value.position.y + 'px')
  }

  setTimeout(render, playbackControlObj.value.interval)
}

render()
