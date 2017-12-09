// @flow
import {React} from '$studio/handy'
import css from './AddBar.css'
import cx from 'classnames'

type Props = {
  shouldRender: boolean,
  depth: number,
  onClick: Function,
  onAnimationStart: Function,
}

type State = {
  isExpanding: boolean,
}

class AddBar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      isExpanding: false,
    }
  }

  toggleExpansionState() {
    this.setState(state => ({isExpanding: !state.isExpanding}))
  }

  clickHandler = () => {
    if (this.state.isExpanding) return
    this.props.onAnimationStart()
    this.toggleExpansionState()
    setTimeout(() => {
      this.toggleExpansionState()
      this.props.onClick()
    }, 250)
  }

  render() {
    const {props, state} = this
    const {shouldRender, depth} = props
    const {isExpanding} = state

    return shouldRender || isExpanding ? (
      <div
        className={cx(css.container, {[css.expanded]: isExpanding})}
        style={{'--depth': depth}}
        onClick={this.clickHandler}
      >
        {!isExpanding && <div className={css.plusSign}>&#x2b;</div>}
        <div className={css.nodePlaceholder} />
      </div>
    ) : null
  }
}

export default AddBar
