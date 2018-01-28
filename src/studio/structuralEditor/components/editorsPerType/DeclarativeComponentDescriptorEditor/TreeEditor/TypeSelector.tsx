// @flow
import {React} from '$studio/handy'
import css from './TypeSelector.css'
import {filter} from 'fuzzaldrin-plus'
import cx from 'classnames'
import * as _ from 'lodash'
import {NODE_TYPE} from './constants'

type Props = {
  listOfDisplayNames: string[]
  nodeProps: Object
}
type State = {
  matchedDisplayNames: string[]
  query: string
  focusedIndex: number
  willUnmount: boolean
}

class TypeSelector extends React.Component<Props, State> {
  state = {
    matchedDisplayNames: this.props.listOfDisplayNames,
    query: '',
    focusedIndex: 0,
    willUnmount: false,
  }

  componentDidMount() {
    this.input.focus()
    document.addEventListener('keydown', this.keyDownHandler)
    document.addEventListener('keyup', this.keyUpHandler)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyDownHandler)
    document.removeEventListener('keyup', this.keyUpHandler)
  }

  keyDownHandler = e => {
    const maxIndex = this.state.matchedDisplayNames.length - 1
    if (e.keyCode === 38) {
      this.setState(state => ({
        focusedIndex: _.clamp(state.focusedIndex - 1, 0, maxIndex),
      }))
    }
    if (e.keyCode === 40) {
      this.setState(state => ({
        focusedIndex: _.clamp(state.focusedIndex + 1, 0, maxIndex),
      }))
    }
  }

  keyUpHandler = e => {
    if (e.keyCode === 13 || e.keyCode === 9) {
      this.selectNameAtIndex(this.state.focusedIndex)
    }
  }

  onInputChange = e => {
    const {value} = e.target
    if (value.toLowerCase() === 't ' && !this.props.nodeProps.hasChildren) {
      this.setState(() => ({willUnmount: true}))
      setTimeout(() => {
        this.props.onSelect({nodeType: NODE_TYPE.TEXT})
      }, 200)
    } else {
      const {listOfDisplayNames} = this.props
      const matchedDisplayNames = value.length > 0
        ? filter(listOfDisplayNames, value)
        : listOfDisplayNames
      this.setState(() => ({
        query: value,
        matchedDisplayNames,
        focusedIndex: 0,
      }))
    }
  }

  selectNameAtIndex(index: number) {
    const displayName = this.state.matchedDisplayNames[index]
    if (displayName == null) return

    this.setState(() => ({willUnmount: true}))
    setTimeout(() => {
      this.props.onSelect({nodeType: NODE_TYPE.COMPONENT, displayName})
    }, 200)
  }

  render() {
    const {nodeProps: {depth, top, left, width}} = this.props
    const {matchedDisplayNames, query, focusedIndex, willUnmount} = this.state
    return (
      <div className={cx(css.wrapper, {[css.willUnmount]: willUnmount})}>
        <div
          className={css.container}
          style={{'--depth': depth, top, left, width}}
        >
          <div className={css.input}>
            <input
              ref={c => (this.input = c)}
              placeholder="type to filter..."
              value={query}
              onChange={this.onInputChange}
              onKeyDown={e => {
                if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 9)
                  e.preventDefault()
              }}
            />
          </div>
          <div className={css.list}>
            {matchedDisplayNames.map((displayName, index) => {
              return (
                <div
                  key={displayName}
                  className={cx(css.option, {
                    [css.isSelected]: index === focusedIndex,
                  })}
                  onMouseEnter={() =>
                    this.setState(() => ({focusedIndex: index}))
                  }
                  onClick={() => this.selectNameAtIndex(index)}
                >
                  {displayName}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
}

export default TypeSelector
