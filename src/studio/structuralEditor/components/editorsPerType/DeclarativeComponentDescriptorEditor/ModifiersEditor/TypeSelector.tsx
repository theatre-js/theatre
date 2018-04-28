import {React} from '$studio/handy'
import css from './TypeSelector.css'
import HeadlessDataList from '$studio/common/components/HeadlessDataList/HeadlessDataList'

interface IProps {
  left: number
  top: number
  width: number
  height: number
  onSelect: (option: string) => any
  onCancel: () => any
}

interface IState {}

class TypeSelector extends React.PureComponent<IProps, IState> {
  input: HTMLInputElement | null

  componentDidMount() {
    window.addEventListener('resize', this.windowResizeHandler)
    this.input!.focus()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.windowResizeHandler)
  }

  windowResizeHandler = () => {
    this.props.onCancel()
  }

  onSelect = (option: string) => {
    this.props.onSelect(option)
  }

  render() {
    const {left, top, width, height} = this.props
    const {innerHeight} = window
    const inputStyle = {
      '--left': left,
      '--top': top,
      '--width': width,
      '--height': height,
    }
    const listStyle = {
      '--left': left + 10,
      '--top': top + height + 2,
      '--width': width - 20,
      '--height': innerHeight - top - height - 4,
    }

    return (
      <HeadlessDataList
        options={[
          'translateX',
          'translateY',
          'translateZ',
          'rotateX',
          'rotateY',
          'rotateZ',
        ]}
        onSelect={this.onSelect}
        onCancel={this.props.onCancel}
        onClickOutside={this.props.onCancel}
      >
        {(onQuery, filteredOptions, focusedIndex) => {
          return (
            <>
              <div className={css.inputContainer} style={inputStyle}>
                <input
                  ref={c => (this.input = c)}
                  type="text"
                  onBlur={this.props.onCancel}
                  onChange={e => onQuery(e.target.value)}
                />
              </div>
              <div className={css.listContainer} style={listStyle}>
                {filteredOptions.map((o, i) => (
                  <div
                    style={{
                      ...(i === focusedIndex
                        ? {textDecoration: 'underline'}
                        : {}),
                    }}
                    key={i}
                  >
                    {o}
                  </div>
                ))}
              </div>
            </>
          )
        }}
      </HeadlessDataList>
    )
  }
}

export default TypeSelector
