// @flow
import {React, compose} from '$studio/handy'
import css from './index.css'

type Props = {
  title: React.Node,
  body: React.Node,
}

class ModifierInspectorWrapper extends React.PureComponent<Props, void> {
  render() {
    const {title, body} = this.props
    return (
      <div className={css.container}>
        {title ? (
          <div className={css.titleContainer}>
            <div className={css.triangle} />
            {typeof title === 'string' ? <div className={css.title}>{title}</div> : title}
          </div>
        ) : null}
        <div className={css.bodyContainer}>{body}</div>
      </div>
    )
  }
}

export default compose(a => a)(ModifierInspectorWrapper)
