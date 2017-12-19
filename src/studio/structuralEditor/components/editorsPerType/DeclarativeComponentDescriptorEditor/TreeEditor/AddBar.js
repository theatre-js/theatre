// @flow
import {React} from '$studio/handy'
import css from './AddBar.css'
import cx from 'classnames'

type Props = {
  depth: number,
  onClick: Function,
  onAnimationStart: Function,
  shouldRenderDropZone: boolean,
  shouldRenderNodePlaceholder: boolean,
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
    const {shouldRenderNodePlaceholder, shouldRenderDropZone, depth} = this.props
    const {isExpanding} = this.state

    const shouldRender = shouldRenderNodePlaceholder || shouldRenderDropZone || isExpanding

    return shouldRender ? (
      <div
        className={cx(css.container, {[css.expanded]: isExpanding})}
        style={{'--depth': depth}}
        onClick={this.clickHandler}
      >
        {!isExpanding && shouldRenderNodePlaceholder && <div className={css.plusSign}>&#x2b;</div>}
        {!isExpanding && shouldRenderDropZone && <div className={css.sign}>&#x2192;</div>}
        {!shouldRenderDropZone && <div className={css.nodePlaceholder} />}
      </div>
    ) : null
  }
}

export default AddBar
