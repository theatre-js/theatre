import {basicFSM} from '@theatre/utils/basicFSM'

export const mousedownActor = basicFSM<[isDown: boolean], boolean>((t) => {
  function toggle(original: boolean) {
    t('down', original, ([isDown]) => {
      if (isDown !== original) toggle(isDown)
    })
  }

  toggle(false)
})({name: 'mouseDownActor'})
