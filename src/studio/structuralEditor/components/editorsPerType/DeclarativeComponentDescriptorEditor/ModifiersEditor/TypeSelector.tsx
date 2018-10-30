import React from 'react'
import connect from '$theater/handy/connect'
import css from './TypeSelector.css'
import HeadlessDataList from '$theater/common/components/HeadlessDataList/HeadlessDataList'
import {ITheaterStoreState} from '$theater/types'
import * as _ from '$shared/utils'
import cx from 'classnames'
import {IModifierDescriptor} from '$theater/componentModel/types'
import Overlay from '$theater/common/components/Overlay/Overlay'

interface IProps {
  left: number
  top: number
  width: number
  height: number
  listOfCoreModifiers: {id: string; name: string}[]
  onSelect: (option: string) => void
  onCancel: () => void
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
    const {id} = this.props.listOfCoreModifiers.find(
      ({name}) => name === option,
    )!
    this.props.onSelect(id)
  }

  render() {
    const {left, top, width, height, listOfCoreModifiers} = this.props
    const {innerHeight} = window
    const inputStyle = {
      '--left': left,
      '--top': top,
      '--width': width,
      '--height': height,
    }
    const listStyle = {
      '--left': left + 10,
      '--top': top + height,
      '--width': width - 20,
      '--height': innerHeight - top - height - 4,
    }

    return (
      <HeadlessDataList
        options={listOfCoreModifiers.map(({name}) => name)}
        onSelectOption={this.onSelect}
        onCancel={this.props.onCancel}
        onSelectNothing={() => {}}
      >
        {(onQuery, filteredOptions, focusedIndex, setFocusedIndexTo) => {
          return (
            <Overlay onClickOutside={this.props.onCancel}>
              <Overlay.Section>
                <div className={css.inputContainer} style={inputStyle}>
                  <input
                    type="text"
                    className={css.input}
                    ref={c => (this.input = c)}
                    onBlur={this.props.onCancel}
                    onChange={e => onQuery(e.target.value)}
                  />
                  <span className={css.hint}>
                    {filteredOptions[focusedIndex]}
                  </span>
                </div>
              </Overlay.Section>
              <Overlay.Section>
                <div className={css.listContainer} style={listStyle}>
                  {filteredOptions.map((option: string, i) => (
                    <div
                      onMouseEnter={() => setFocusedIndexTo(i)}
                      onMouseDown={() => this.onSelect(option)}
                      className={cx(css.option, {
                        [css.isSelected]: i === focusedIndex,
                      })}
                      key={i}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </Overlay.Section>
            </Overlay>
          )
        }}
      </HeadlessDataList>
    )
  }
}

export default connect((s: ITheaterStoreState) => {
  const coreModifierDescriptors = _.get(s, [
    'ahistoricComponentModel',
    'coreModifierDescriptors',
  ])
  return {
    listOfCoreModifiers: Object.values(coreModifierDescriptors).map(
      (desc: IModifierDescriptor) => ({
        id: desc.id,
        name: desc.id.split('/').slice(-1)[0],
      }),
    ),
  }
})(TypeSelector)
