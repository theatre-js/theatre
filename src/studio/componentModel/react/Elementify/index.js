// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'
import {type ComponentInstantiationDescriptor} from '$studio/componentModel/types'
import * as D from '$shared/DataVerse'
// import {TheaterJSComponent} from '$studio/handy'

type Props = {
  descriptor: $Call<typeof D.referencifyDeep, ComponentInstantiationDescriptor>,
}

class Elementify extends React.PureComponent<Props, void> {
  constructor(props: Props) {
    super(props)
  }

  render() {

    return <div>Elementify here, {JSON.stringify('this')}</div>
  }
}

export default compose(
  (a) => a
)(Elementify)