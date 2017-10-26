// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import css from './index.css'

type Props = {}

type State = {}

class index extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    return <div className={css.container}>X2 here</div>
  }
}

export default compose(
  (a) => a
)(index)