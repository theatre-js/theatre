import {React} from '$src/studio/handy'
import css from './SelectionArea.css'
import cx from 'classnames'
import DraggableArea from '$studio/common/components/DraggableArea/DraggableArea';

interface Props {
  status: $FixMe
  left?: number
  top?: number
  width?: number
  height?: number
  onEnd: Function
}

interface State {}

class SelectionArea extends React.Component<Props, State> {
  render() {
    const {status} = this.props
    const isSelectionConfirmed = status === 'CONFIRMED'

    if (status === 'ACTIVE' || isSelectionConfirmed) {
      let {left, top, width, height} = this.props
      left = width < 0 ? left + width : left
      top = height < 0 ? top + height : top
      width = Math.abs(width)
      height = Math.abs(height)
      return (
        <div className={css.container} onClick={() => this.props.onEnd()}>
          <DraggableArea
            shouldRegisterEvents={isSelectionConfirmed}
            onDragStart={() => console.log('drag start')}
            onDrag={() => console.log('drag')}
            onDragEnd={() => console.log('drag end')}
          >
            <div
              className={cx(css.selection, {[css.shrink]: isSelectionConfirmed})}
              style={{left, top, width, height}}
              onClick={e => {
                e.stopPropagation()
              }}
            />
          </DraggableArea>
        </div>
      )
    }

    return null
  }
}

export default SelectionArea
