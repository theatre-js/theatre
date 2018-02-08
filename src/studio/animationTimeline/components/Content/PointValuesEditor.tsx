import {React} from '$studio/handy'
import SingleInputForm from '$lf/common/components/SingleInputForm'
import css from './PointValuesEditor.css'

interface IProps {}

interface IState {}

class PointValuesEditor extends React.PureComponent<IProps, IState> {
  state = {
    value: String(this.props.initialValue),
    time: (this.props.initialTime/1000).toFixed(2),
  }

  componentDidMount() {
    this.valueInput.focus()
    this.valueInput.select()
  }

  handleClick = (e) => {
    e.stopPropagation()
    if (e.target === this.wrapper) this.props.onClose()
  }

  handleKeyDown = (e, input: 'time' | 'value') => {
    if (e.keyCode === 9) {
      e.preventDefault()
      this.props.onSubmit({
        time: Number(this.state.time) * 1000,
        value: Number(this.state.value),
      })
      if (input === 'time') {
        this.timeInput.blur()
        this.valueInput.focus()
        this.valueInput.select()
      }
      if (input === 'value') {
        console.log('hum')
        this.valueInput.blur()
        this.timeInput.focus()
        this.timeInput.select()
      }
    }
    if (e.keyCode === 13) {
      this.props.onSubmit({
        time: Number(this.state.time) * 1000,
        value: Number(this.state.value),
      })
      this.props.onClose()
    }
    if (e.keyCode === 27) {
      this.props.onClose()
    }
  }
  
  handleChange = (e: $FixMe, input: 'time' | 'value') => {
    const {value} = e.target
    if (input === 'time') this.setState(() => ({time: value}))
    if (input === 'value') this.setState(() => ({value: value}))
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
            <input
              ref={c => this.timeInput = c}
              className={css.input}
              value={this.state.time}
              onKeyDown={(e) => this.handleKeyDown(e, 'time')}
              onChange={(e) => this.handleChange(e, 'time')}
            />
            </div>
          <div className={css.row}>
            <span className={css.icon}>
              {String.fromCharCode(0x25b2)}
            </span>
              <input
                ref={c => this.valueInput = c}
                className={css.input}
                value={this.state.value}
                onKeyDown={(e) => this.handleKeyDown(e, 'value')}
                onChange={(e) => this.handleChange(e, 'value')}              
              />
          </div>
        </div>
      </div>
    )
  }
}

export default PointValuesEditor
