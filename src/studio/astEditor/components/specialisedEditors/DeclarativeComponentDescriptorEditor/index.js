// @flow
import {React, compose} from '$studio/handy'
import css from './index.css'
import set from 'lodash/fp/set'

console.log(set)

type Props = {}

type State = void

class DeclarativeComponentDescriptorEditor extends React.PureComponent<Props, State> {
  state: State
  props: Props

  constructor(props: Props) {
    super(props)
    this.state = undefined
  }

  render() {
    return (
      <div className={css.container}>Editing Declartive Component Desctitor here</div>
    )
  }
}

export default compose(a => a)(DeclarativeComponentDescriptorEditor)
