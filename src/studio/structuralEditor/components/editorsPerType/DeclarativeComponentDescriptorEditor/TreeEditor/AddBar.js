// @flow
import {React} from '$studio/handy'
import css from './AddBar.css'

type Props = any

type State = void

class AddBar extends React.Component<Props, State> {
  render() {
    return (
      <div className={css.container}>
        <div className={css.plusSign}>+</div>
        <div className={css.nodePlaceholder}>a</div>
      </div>
    )
  }
}

export default AddBar