import {getProject} from '@theatre/core'
import studio from '@theatre/studio'

studio.initialize()

const proj = getProject('Musical project')
const sheet = proj.sheet('Scene')
sheet.object('An object', {x: 0})

setTimeout(async () => {
  // const d = defer()
  // window.addEventListener('click', () => {
  //   d.resolve(null)
  // })
  // await d.promise
  const {gainNode, audioContext} = await sheet.sequence.attachAudio({
    source: 'http://localhost:5000/audio.mp3',
  })

  const lowerGain = audioContext.createGain()
  gainNode.disconnect()
  gainNode.connect(lowerGain)

  lowerGain.gain.setValueAtTime(0.01, audioContext.currentTime)
  lowerGain.connect(audioContext.destination)

  sheet.sequence.position = 11
  await sheet.sequence.play({
    iterationCount: 4,
    range: [10, 14],
    direction: 'normal',
    rate: 2,
  })
  // await sheet.sequence.play({
  //   iterationCount: 2,
  //   range: [20, 22],
  //   direction: 'normal',
  //   rate: 4,
  // })
}, 10)
