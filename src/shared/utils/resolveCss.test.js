// @flow
import resolveCss from '$shared/utils/resolveCss'

describe('common/utils/resolveCss()', () => {
  function example(a, b, expectation: string) {
    it(`${JSON.stringify([a, b])}`, () => {
      expect(resolveCss(a)(...b).className).toEqual(expectation)
    })
  }

  describe('examples', () => {
    example({container: 'c1'}, ['container'], 'c1')
    example([{container: 'c1'}], ['container', null, undefined], 'c1')
    example([{container: 'c1'}, {container: 'c2'}], ['container'], 'c1 c2')
    example([{container: 'c1'}, {container: 'c2'}, {}], ['container'], 'c1 c2')
    example([{container: 'c1'}, {container: ''}], ['container'], 'c1')
    example([{container: 'c1'}, {container: ''}], ['container'], 'c1')
    example(
      [
        {container: ''},
        {container: 'c1'},
        {container: ''},
        {container: ''},
        {container: 'c2'},
      ],
      ['container'],
      'c1 c2',
    )
    example(
      [
        {container: ''},
        {container: 'c1'},
        [{container: ''}, [{container: ''}, {container: 'c2'}]],
      ],
      ['container'],
      'c1 c2',
    )
    example(
      [{container: 'c1', hover: 'h1'}, {container: 'c2'}],
      ['container', 'hover'],
      'c1 c2 h1',
    )
    example([{container: 'c1'}, {container: '!override'}], ['container', 'hover'], '')
    example(
      [{container: 'c1'}, {container: 'c2 !override'}],
      ['container', 'hover'],
      'c2',
    )
    example(
      [{container: 'c1'}, undefined, null, {container: 'c2 !override'}],
      ['container', 'hover'],
      'c2',
    )
    example(
      [{container: 'c1'}, {container: 'c2 !override'}, {container: 'c3'}],
      ['container', 'hover'],
      'c2 c3',
    )
    example(
      [{container: 'c1'}, [{container: 'c2 !override'}, {container: 'c3'}]],
      ['container', 'hover'],
      'c2 c3',
    )
  })
})
