import {reduceHistoricState} from '$theater/bootstrap/actions'
import Theater from '$theater/bootstrap/Theater'
import createRootComponentForReact from '$theater/componentModel/react/createRootComponentForReact'
import {ITheaterStoreState} from '$theater/types'
import immer from 'immer'
import React from 'react'
import ReactDOM from 'react-dom'
import {IModifierInstantiationValueDescriptor} from '../types/declarative'
import {
  IDeclarativeComponentDescriptor,
  IReferenceToLocalHiddenValue,
  IComponentInstantiationValueDescriptor,
} from '../types/declarative'

type Utils = {
  updateState: (fn: (s: ITheaterStoreState) => void) => void
  rootDiv: HTMLDivElement
  updateComponent: (
    id: string,
    updater: (s: IDeclarativeComponentDescriptor) => void,
  ) => void
  theater: Theater
}

interface TestFn {
  (testName: string, fn: (utils: Utils) => void): void
  skip: typeof it.skip
}

// @ts-ignore ignore
const test: TestFn = (testName: string, fn: (utils: Utils) => void) => {
  return it(testName, () => {
    const theater = new Theater({withStudio: false})
    const updateState = (fn: (s: ITheaterStoreState) => void) => {
      theater.store.reduxStore.dispatch(
        reduceHistoricState([], s => {
          return immer(s, fn)
        }),
      )
    }

    updateState(s => {
      const rootComp: IDeclarativeComponentDescriptor = {
        __descriptorType: 'DeclarativeComponentDescriptor',
        displayName: 'Root',
        id: 'Root',
        isScene: true,
        timelineDescriptors: {
          byId: {
            defaultTimeline: {
              __descriptorType: 'TimelineDescriptor',
              id: 'defaultTimeline',
              vars: {},
            },
          },
          list: ['defaultTimeline'],
        },
        localHiddenValuesById: {
          container: {
            __descriptorType: 'ComponentInstantiationValueDescriptor',
            componentId: 'TheaterJS/Core/HTML/div',
            props: {
              children: 'empty',
            },
          },
        },
        whatToRender: {
          __descriptorType: 'ReferenceToLocalHiddenValue',
          which: 'container',
        },
      }
      s.historicComponentModel.customComponentDescriptors.Root = rootComp
      s.historicWorkspace.viewports.whatToShowInBody = {
        type: 'TestingOnly:DirectlyRenderComponent',
        componentId: 'Root',
      }
    })

    const updateComponent = (
      id: string,
      update: (c: IDeclarativeComponentDescriptor) => void,
    ): void => {
      updateState(s => {
        update(s.historicComponentModel.customComponentDescriptors[
          id
        ] as $IntentionalAny)
      })
    }

    const TheaterRoot = createRootComponentForReact(theater)
    const rootDiv = document.createElement('div')
    ReactDOM.render(<TheaterRoot>passthrough content</TheaterRoot>, rootDiv)

    const utils = {updateState, rootDiv, updateComponent, theater}
    fn(utils)
    ReactDOM.unmountComponentAtNode(rootDiv)
  })
}

const modifiers = (...mods: $FixMe[]) => {
  const byId: $FixMe = {}
  const list = []
  let i = 0
  for (const mod of mods) {
    i++
    const id = String(i)
    byId[id] = mod
    list.push(id)
  }

  return {byId, list}
}

const modifier = (
  modifierId: string,
  props: {},
): IModifierInstantiationValueDescriptor => {
  return {
    __descriptorType: 'ModifierInstantiationValueDescriptor',
    enabled: true,
    modifierId,
    props,
  }
}

test.skip = it.skip

describe(`components`, () => {
  describe(`the testing setup itself`, () => {
    test('should work', utils => {
      expect(utils.rootDiv.innerHTML).toEqual('<div>empty</div>')
    })
  })

  describe(`changing props`, () => {
    test(`Swapping the value of children directly`, utils => {
      utils.updateComponent('Root', s => {
        // @ts-ignore ignore
        s.localHiddenValuesById.container.props.children = '2'
      })
      expect(utils.rootDiv.innerHTML).toEqual('<div>empty</div>')
      utils.theater.ticker.tick()
      expect(utils.rootDiv.innerHTML).toEqual('<div>2</div>')
    })

    test('Children coming from a reference', utils => {
      utils.updateComponent('Root', s => {
        s.localHiddenValuesById.spanInContainer = '2'
        const ref: IReferenceToLocalHiddenValue = {
          __descriptorType: 'ReferenceToLocalHiddenValue',
          which: 'spanInContainer',
        }
        // @ts-ignore ignore
        s.localHiddenValuesById.container.props.children = ref
      })

      expect(utils.rootDiv.innerHTML).toEqual('<div>empty</div>')
      utils.theater.ticker.tick()
      expect(utils.rootDiv.innerHTML).toEqual('<div>2</div>')
    })

    test('Swapping the value of a reference', utils => {
      utils.updateComponent('Root', s => {
        s.localHiddenValuesById.spanInContainer = '2'
        const ref: IReferenceToLocalHiddenValue = {
          __descriptorType: 'ReferenceToLocalHiddenValue',
          which: 'spanInContainer',
        }
        // @ts-ignore ignore
        s.localHiddenValuesById.container.props.children = ref
      })

      utils.theater.ticker.tick()
      expect(utils.rootDiv.innerHTML).toEqual('<div>2</div>')
      utils.updateComponent('Root', s => {
        s.localHiddenValuesById.spanInContainer = '3'
      })
      utils.theater.ticker.tick()
      expect(utils.rootDiv.innerHTML).toEqual('<div>3</div>')

      utils.updateComponent('Root', s => {
        s.localHiddenValuesById.spanInContainer = ['3', '4']
      })
      utils.theater.ticker.tick()
      expect(utils.rootDiv.innerHTML).toEqual('<div>34</div>')

      utils.updateComponent('Root', s => {
        s.localHiddenValuesById.spanInContainer = '5'
      })
      utils.theater.ticker.tick()
      expect(utils.rootDiv.innerHTML).toEqual('<div>5</div>')

      utils.updateComponent('Root', s => {
        const instantiationDesc: IComponentInstantiationValueDescriptor = {
          __descriptorType: 'ComponentInstantiationValueDescriptor',
          componentId: 'TheaterJS/Core/HTML/span',
          props: {
            children: '1',
          },
          modifierInstantiationDescriptors: {
            byId: {},
            list: [],
          },
        }
        s.localHiddenValuesById.spanInContainer = instantiationDesc
      })
      utils.theater.ticker.tick()
      expect(utils.rootDiv.innerHTML).toEqual('<div><span>1</span></div>')

      utils.updateComponent('Root', s => {
        // @ts-ignore ignore
        s.localHiddenValuesById.spanInContainer.props.children = '2'
      })
      utils.theater.ticker.tick()
      expect(utils.rootDiv.innerHTML).toEqual('<div><span>2</span></div>')

      utils.updateComponent('Root', s => {
        // @ts-ignore ignore
        s.localHiddenValuesById.spanInContainer.props.children = ['1', '2']
      })
      utils.theater.ticker.tick()
      expect(utils.rootDiv.innerHTML).toEqual('<div><span>12</span></div>')

      utils.updateComponent('Root', s => {
        // @ts-ignore ignore
        s.localHiddenValuesById.spanInContainer.props.children = null
      })
      utils.theater.ticker.tick()
      expect(utils.rootDiv.innerHTML).toEqual('<div><span></span></div>')

      utils.updateComponent('Root', s => {
        // @ts-ignore ignore
        s.localHiddenValuesById.spanInContainer.props.children = [null, null]
      })
      utils.theater.ticker.tick()
      expect(utils.rootDiv.innerHTML).toEqual('<div><span></span></div>')
      utils.updateComponent('Root', s => {
        const one: IComponentInstantiationValueDescriptor = {
          __descriptorType: 'ComponentInstantiationValueDescriptor',
          componentId: 'TheaterJS/Core/HTML/div',
          props: {
            children: 'one',
          },
          modifierInstantiationDescriptors: {
            byId: {},
            list: [],
          },
        }

        const refToOne: IReferenceToLocalHiddenValue = {
          __descriptorType: 'ReferenceToLocalHiddenValue',
          which: 'one',
        }
        s.localHiddenValuesById.one = one
        // @ts-ignore ignore
        s.localHiddenValuesById.spanInContainer.props.children = refToOne
      })
      utils.theater.ticker.tick()
      expect(utils.rootDiv.innerHTML).toEqual(
        '<div><span><div>one</div></span></div>',
      )
      utils.updateComponent('Root', s => {
        const two: IComponentInstantiationValueDescriptor = {
          __descriptorType: 'ComponentInstantiationValueDescriptor',
          componentId: 'TheaterJS/Core/HTML/div',
          props: {
            children: 'two',
          },
        }

        const refToTwo: IReferenceToLocalHiddenValue = {
          __descriptorType: 'ReferenceToLocalHiddenValue',
          which: 'two',
        }
        s.localHiddenValuesById.two = two
        // @ts-ignore ignore
        s.localHiddenValuesById.spanInContainer.props.children = [
          null,
          refToTwo,
          null,
        ]
      })
      utils.theater.ticker.tick()
      expect(utils.rootDiv.innerHTML).toEqual(
        '<div><span><div>two</div></span></div>',
      )
    })
  })

  describe(`modifiers`, () => {
    test('assigning/updating/deleting a modifier', utils => {
      utils.updateComponent('Root', s => {
        s.localHiddenValuesById.container.modifierInstantiationDescriptors = modifiers(
          modifier('TheaterJS/Core/HTML/SetCustomStyle', {
            pairings: {
              list: ['1'],
              byId: {
                '1': {
                  key: 'opacity',
                  value: '0.2',
                },
              },
            },
          }),
        )
      })
      utils.theater.ticker.tick()
      expect(utils.rootDiv.innerHTML).toEqual(
        '<div style="opacity: 0.2;">empty</div>',
      )

      utils.updateComponent('Root', s => {
        s.localHiddenValuesById.container.modifierInstantiationDescriptors = modifiers(
          modifier('TheaterJS/Core/HTML/SetCustomStyle', {
            pairings: {
              list: ['1', '2'],
              byId: {
                '1': {
                  key: 'opacity',
                  value: '0.2',
                },
                '2': {
                  key: 'border',
                  value: '1px solid red',
                },
              },
            },
          }),
        )
      })
      utils.theater.ticker.tick()
      expect(utils.rootDiv.innerHTML).toEqual(
        '<div style="opacity: 0.2; border: 1px solid red;">empty</div>',
      )

      utils.updateComponent('Root', s => {
        s.localHiddenValuesById.container.modifierInstantiationDescriptors = modifiers()
      })
      // debugger
      utils.theater.ticker.tick()
      expect(utils.rootDiv.innerHTML).toEqual('<div style="">empty</div>')
    })
  })
})
