// @flow
import {React} from '$studio/handy'
import css from './ContextMenu.css'

type Props = {
  depth: number,
  onMove: Function,
  onAddChild: Function,
  onDelete: Function,
}

class ContextMenu extends React.PureComponent<Props, void> {
  render() {
    const {depth, onMove, onDelete, onAddChild} = this.props

    return (
      <div className={css.container} style={{'--depth': depth}}>
        <div className={css.menu}>
          <div className={css.pad}>
            <div
              className={css.buttonLeftRight}
              onClick={() => onMove('left')}>{String.fromCharCode(0x25C0)}</div>
            <div className={css.upDownContainer}>
              <div
                className={css.buttonUpDown}
                onClick={() => onMove('up')}>{String.fromCharCode(0x25B2)}</div>
              <div
                className={css.buttonUpDown}
                onClick={() => onMove('down')}>{String.fromCharCode(0x25BC)}</div>
            </div>
            <div
              className={css.buttonLeftRight}
              onClick={() => onMove('right')}>{String.fromCharCode(0x25B6)}</div>
          </div>
          <div className={css.button} onClick={onDelete}>Delete</div>
          <div className={css.button} onClick={onAddChild}>Add Child</div>
        </div>
      </div>
    )
  }
}

export default ContextMenu
