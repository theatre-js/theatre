import React from 'react'
import {clamp} from 'lodash'
import {filter} from 'fuzzaldrin-plus'

type OptionsList = string[]

interface IProps {
  options: OptionsList
  onCancel: () => void
  onSelectOption: (option: string) => any
  onSelectNothing: () => any
  children: (
    onQuery: Function,
    filteredOptions: OptionsList,
    focusedIndex: number,
    setFocusedIndexTo: Function,
  ) => any
}

interface IState {
  filteredOptions: OptionsList
  focusedIndex: number
}

class HeadlessDataList extends React.PureComponent<IProps, IState> {
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

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyDownHandler)
  }

  private keyDownHandler = (e: KeyboardEvent) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      const {filteredOptions, focusedIndex} = this.state
      if (filteredOptions.length === 0) this.props.onSelectNothing()
      if (focusedIndex < filteredOptions.length)
        this.props.onSelectOption(filteredOptions[focusedIndex])
    }
    if (e.keyCode === 27) {
      e.preventDefault()
      this.props.onCancel()
    }
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
    this.setState((_, {options}) => {
      return {
        filteredOptions: q.length === 0 ? options : filter(options, q),
        focusedIndex: 0,
      }
    })
  }

  setFocusedIndexTo = (focusedIndex: number) => {
    this.setState(() => ({focusedIndex}))
  }

  render() {
    const {filteredOptions, focusedIndex} = this.state
    return this.props.children(
      this.onQuery,
      filteredOptions,
      focusedIndex,
      this.setFocusedIndexTo,
    )
  }
}

export default HeadlessDataList
