import type {IExtension} from '@theatre/studio'
import studio from '@theatre/studio'
import '@theatre/core'
import {extensionButton} from '../../shared/utils/useExtensionButton'

const ext1: IExtension = {
  id: '@theatre/hello-world-extension',
  toolbars: {
    global(set, studio) {
      console.log('mount 1')

      set([
        {
          type: 'Icon',
          title: 'Icon 1',
          svgSource: '1',
          onClick: () => {
            console.log('Icon 1')
          },
        },
      ])

      return () => {
        console.log('unmount 1')
      }
    },
  },
  panes: [],
}

studio.initialize({usePersistentStorage: false})

let currentStep = -1

extensionButton(
  'Forward',
  () => {
    if (currentStep < steps.length - 1) {
      currentStep++
      steps[currentStep]()
    }
  },
  '>',
)

const steps = [
  function step1() {
    studio.extend(ext1)
  },
  function step2() {
    studio.extend(
      {
        ...ext1,
        toolbars: {
          global(set, studio) {
            console.log('mount 2')

            set([
              {
                type: 'Icon',
                title: 'Icon 2',
                svgSource: '2',
                onClick: () => {
                  console.log('Icon 2')
                },
              },
            ])
            return () => {
              console.log('unmount 2')
            }
          },
        },
      },
      {__experimental_reconfigure: true},
    )
  },
  function step3() {
    studio.extend(
      {
        ...ext1,
        toolbars: {},
      },
      {__experimental_reconfigure: true},
    )
  },
]
