// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'
import {type ComponentInstantiationDescriptor} from '$studio/componentModel/types'
import * as D from '$shared/DataVerse'
import {makeReactiveComponent} from '$studio/handy'
import ElementifyHardCodedComponent from './ElementifyHardCodedComponent'
import ElementifyDeclarativeComponent from './ElementifyDeclarativeComponent'
import type {Studio} from '$studio/handy'
import stringStartsWith from 'lodash/startsWith'

// type Props = {
//   // @todo use IReactive types instead
//   descriptor: $Call<typeof D.atomifyDeep, ComponentInstantiationDescriptor>,
// }

const getComponentDescriptorById = (id: D.Derivation<string>, studio: Studio): D.Derivation<?ComponentInstantiationDescriptor> =>
  id.flatMap((id) =>
    stringStartsWith(id, 'TheaterJS/Core/')
    ? studio.atom.pointer().prop('coreComponents').prop(id)
    : studio.atom.pointer().prop('state').prop('componentDescriptors').prop(id)
  )

const getFinalComponentescriptor = (initialComponentId: D.Derivation<string>, studio: Studio) => {
  return getComponentDescriptorById(initialComponentId, studio).flatMap((des) => {

  })
}

export default makeReactiveComponent({
  modifyBaseDerivation: (d) => d.extend({
    render(d) {
      return getFinalComponentescriptor(
        d.pointer().prop('props').prop('descriptor').prop('componendID'), d.pointer().prop('studio')
        ).flatMap((descriptor) => {
          if (!descriptor) return <div>cannot find this component</div>

          return new D.SimpleDerivation({
            descriptorType: descriptor.prop('type'),
            key: d.pointer().prop('props').prop('key'),
            },
            (f) => {
              if (f.descriptorType === 'Declarative') {
                return <ElementifyHardCodedComponent key={f.key} props={d.pointer().prop('props').prop('descriptor').prop('props')} />
              } else {
                return <ElementifyDeclarativeComponent key={f.key} props={d.pointer().prop('props').prop('descriptor').prop('props')} />
              }
          })
        })
    },
  }),
})