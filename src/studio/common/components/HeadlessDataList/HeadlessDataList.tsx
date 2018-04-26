import {React} from '$studio/handy'
import Overlay from '$studio/common/components/Overlay/Overlay'
import {clamp} from 'lodash'

type OptionsList = string[]
// options: {key: string | number; value: string | number}[]

interface IProps {
  options: OptionsList
  onClickOutside: Function
  children(
    onQuery: Function,
    filteredOptions: OptionsList,
    focusedIndex: number,
  ): React.ReactFragment
}

interface IState {
  filteredOptions: OptionsList
  focusedIndex: number
}

class DataList extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      filteredOptions: props.options,
      focusedIndex: 0,
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyDownHandler)
  }

  private keyDownHandler = (e: KeyboardEvent) => {
    if (e.keyCode === 38) {
      e.preventDefault()
      this.setState(({focusedIndex}) => ({
        focusedIndex: clamp(focusedIndex - 1, 0, Infinity),
      }))
    }
    if (e.keyCode === 40) {
      e.preventDefault()
      this.setState(({filteredOptions, focusedIndex}) => {
        const max = filteredOptions.length - 1
        return {
          focusedIndex: clamp(focusedIndex + 1, 0, max),
        }
      })
    }
  }

  private onQuery = (q: string) => {
    this.setState(({focusedIndex}, {options}) => {
      const filteredOptions = options.filter((o: string) => {
        return o.includes(q)
      })
      const max = filteredOptions.length - 1
      focusedIndex = clamp(focusedIndex, 0, max)
      return {
        filteredOptions,
        focusedIndex,
      }
    })
  }

  render() {
    const {filteredOptions, focusedIndex} = this.state
    const children = React.Children.map(
      this.props.children(this.onQuery, filteredOptions, focusedIndex),
      (fragment: React.ReactElement<any>) => {
        return React.Children.map(
          fragment.props.children,
          (child: React.ReactElement<any>) => {
            return React.createElement(Overlay.Section, {}, child)
          },
        )
      },
    )

    return (
      <Overlay onClickOutside={this.props.onClickOutside}>{children}</Overlay>
    )
  }
}

export default DataList
