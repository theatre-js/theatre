// @flow
import {React} from '$studio/handy'
import css from './NodePlaceholder.css'

type Props = {
  shouldRender: boolean,
}
type State = {
  shouldRemainVisible: boolean,
}

class NodePlaceholder extends React.PureComponent<Props, State> {
  state = {shouldRemainVisible: false}
  mouseEnterHandler = () => {
    this.setState(() => ({shouldRemainVisible: true}))
    this.props.onMouseEnter()
  }

  mouseLeaveHandler = () => {
    this.setState(() => ({shouldRemainVisible: false}))
    this.props.onMouseLeave()
  }

  mouseUpHandler = () => {
    this.setState(() => ({shouldRemainVisible: false}))
  }

  render() {
    const {shouldRender, renderDropZone, depth} = this.props
    const {shouldRemainVisible} = this.state
    return (
      <div ref={c => (this.wrapper = c)} className={css.wrapper}>
        {shouldRender || shouldRemainVisible ? (
          <div
            className={css.container}
            onMouseEnter={this.mouseEnterHandler}
            onMouseLeave={this.mouseLeaveHandler}
            onMouseUp={this.mouseUpHandler}
          >
            {renderDropZone ? (
              <div className={css.sign}>&#x2192;</div>
            ) : (
              <div>
                <div onClick={this.props.onAdd} className={css.addButton}>
                  &#x2b;
                </div>
                <div className={css.node} style={{'--depth': depth}} />
              </div>
            )}
          </div>
        ) : null}
      </div>
    )
  }
}

export default NodePlaceholder
