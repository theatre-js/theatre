import React from 'react'
import connect from '$studio/handy/connect'
import css from './TypeSelector.css'
import HeadlessDataList from '$studio/common/components/HeadlessDataList/HeadlessDataList'
import {IStudioStoreState} from '$studio/types'
import _ from 'lodash'
import cx from 'classnames'
import {IModifierDescriptor} from '$studio/componentModel/types'

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
      '--top': top + height + 2,
      '--width': width - 20,
      '--height': innerHeight - top - height - 4,
    }

    return (
      <HeadlessDataList
        options={listOfCoreModifiers.map(({name}) => name)}
        onSelect={this.onSelect}
        onCancel={this.props.onCancel}
        onClickOutside={this.props.onCancel}
      >
        {(onQuery, filteredOptions, focusedIndex) => {
          return (
            <>
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
              <div className={css.listContainer} style={listStyle}>
                {filteredOptions.map((option: string, i) => (
                  <div
                    className={cx(css.option, {
                      [css.isSelected]: i === focusedIndex,
                    })}
                    key={i}
                  >
                    {option}
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

export default connect((s: IStudioStoreState) => {
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
