// @flow
import {React, compose} from '$studio/handy'
import css from './PanelSection.css'
import cx from 'classnames'

type Props = {
  children: React.Node,
  withHorizontalMargin: undefined | null | boolean,
  label?: string,
}

type State = void

class PanelSection extends React.PureComponent<Props, State> {
  state: State
  props: Props

  constructor(props: Props) {
    super(props)
    this.state = undefined
  }

  render() {
    const hasLabel = typeof this.props.label === 'string'
    return (
      <div
        className={cx(css.container, {
          [css.withHorizontalMargin]: this.props.withHorizontalMargin !== false,
          [css.hasLabel]: hasLabel,
        })}
      >
        {hasLabel && (
          <div className={css.label}>
            <span className={css.labelText}>{this.props.label}</span>
          </div>
        )}
        <div className={css.body}>{this.props.children}</div>
      </div>
    )
  }
}

export default compose(a => a)(PanelSection)
