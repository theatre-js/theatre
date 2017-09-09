// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'
import {type ComponentInstantiationDescriptor} from '$studio/componentModel/types'
import * as D from '$shared/DataVerse'

type Props = {
  descriptor: $Call<typeof D.referencifyDeep, ComponentInstantiationDescriptor>,
}

class Elementify extends React.Component<Props, void> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    console.log('desc', this.props.descriptor.unboxDeep())
    return <div>Elementify here, {JSON.stringify('this')}</div>
  }
}

export default compose(
  (a) => a
)(Elementify)