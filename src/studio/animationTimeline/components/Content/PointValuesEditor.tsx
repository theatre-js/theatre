import {React} from '$studio/handy'
import SingleInputForm from '$lf/common/components/SingleInputForm'
import css from './PointValuesEditor.css'

interface IProps {}

interface IState {}

class PointValuesEditor extends React.PureComponent<IProps, IState> {
  handleClick = (e) => {
    e.stopPropagation()
    if (e.target === this.wrapper) this.props.onClose()
  }

  handleSubmit = (input: 'time' | 'value', value) => {
    const newPosition = {
      time: input === 'time' ? Number(value) : this.props.initialTime,
      value: input === 'value' ? Number(value) : this.props.initialValue,
    }
    this.props.onSubmit(newPosition)
    this.props.onClose()
  }

  render() {
    const {left, top, initialValue, initialTime} = this.props
    return (
      <div
        ref={c => this.wrapper = c}
        className={css.wrapper}
        onMouseDown={this.handleClick}
        onWheel={(e) => e.stopPropagation()}
        >
        <div
          className={css.container}
          style={{left, top}}
        >
          <div className={css.row}>
            <span className={css.icon}>
              {String.fromCharCode(0x25ba)}
            </span>
            <SingleInputForm
              autoFocus={false}
              ref={c => {
                if (c != null) this.timeInput = c
              }}
              className={css.input}
              value={String(initialTime)}
              onCancel={this.props.onClose}
              onSubmit={(val) => this.handleSubmit('time', val)}
            />
          </div>
          <div className={css.row}>
            <span className={css.icon}>
              {String.fromCharCode(0x25b2)}
            </span>
            <SingleInputForm
              ref={c => {
                if (c != null) this.valueInput = c
              }}
              className={css.input}
              value={String(initialValue)}
              onCancel={this.props.onClose}
              onSubmit={(val) => this.handleSubmit('value', val)}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default PointValuesEditor
