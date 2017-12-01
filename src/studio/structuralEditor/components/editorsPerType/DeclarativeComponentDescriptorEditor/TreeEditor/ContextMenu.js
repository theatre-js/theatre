// @flow
import {React} from '$studio/handy'
import css from './ContextMenu.css'
import cx from 'classnames'

type Props = {
  depth: number,
  onMove: Function,
  onAddChild: Function,
  onDelete: Function,
}

class ContextMenu extends React.PureComponent<Props, void> {
  render() {
    const {depth, onMove, onDelete, onAddChild} = this.props

    const containerStyle = cx(css.container, {
      [css.normal]: onMove && onDelete && onAddChild,
      [css.text]: onMove && onDelete && !onAddChild,
      [css.root]: !onMove && !onDelete && onAddChild,
    })
    return (
      <div className={containerStyle} style={{'--depth': depth}}>
        <div className={css.menu}>
          {onMove && (
            <div className={css.pad}>
              <div className={css.buttonLeftRight} onClick={() => onMove('left')}>
                {String.fromCharCode(0x25c0)}
              </div>
              <div className={css.upDownContainer}>
                <div className={css.buttonUpDown} onClick={() => onMove('up')}>
                  {String.fromCharCode(0x25b2)}
                </div>
                <div className={css.buttonUpDown} onClick={() => onMove('down')}>
                  {String.fromCharCode(0x25bc)}
                </div>
              </div>
              <div className={css.buttonLeftRight} onClick={() => onMove('right')}>
                {String.fromCharCode(0x25b6)}
              </div>
            </div>
          )}
          {onDelete && (
            <div className={css.button} onClick={onDelete}>
              Delete
            </div>
          )}
          {onAddChild && (
            <div className={css.button} onClick={onAddChild}>
              Add Child
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default ContextMenu
