// @flow
import {ModifierDescriptor} from '$studio/componentModel/types'
import * as D from '$shared/DataVerse'
import commonStylesPrototype from './commonStylesPrototype'

const getClass = (propsP, dict) => {
  return dict.extend(commonStylesPrototype).extend({
    reifiedStyles(d) {
      return d.propFromSuper('reifiedStyles').flatMap(reifiedStyles => {
        const ret = propsP
          .prop('pairings')
          .prop('list')
          .flatMap(list => {
            return list.reduce((accDict, pairingId) => {
              const pairingP = propsP
                .prop('pairings')
                .prop('byId')
                .prop(pairingId)

              const keyP = pairingP.prop('key')
              const valueP = pairingP.prop('value')
              return keyP.flatMap((key: string) => {
                return accDict.extend(
                  D.atoms.dict({[key]: valueP}).derivedDict(),
                )
              })
            }, reifiedStyles)
          })

        return ret
      })
    },
  })
}

const descriptor: ModifierDescriptor = {
  id: 'TheaterJS/Core/HTML/SetCustomStyle',
  getClass,
}

export default descriptor
