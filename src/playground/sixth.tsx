import {dict} from '$src/shared/DataVerse/atoms'
import {skipFindingColdDerivations} from '$src/shared/debug'

skipFindingColdDerivations()

const d = dict({
  a: dict({
    aa: dict({
      aaa: 'hi',
    }),
  }),
})

const dD = d.derivedDict()

const aaaP = dD
  .pointer()
  .prop('a')
  .prop('aa')
// .prop('aaa')

// d.deleteProp('a')
// d.setProp('a', dict({aa: dict({aaa: 'bye'})}))

console.log(aaaP.getValue())
