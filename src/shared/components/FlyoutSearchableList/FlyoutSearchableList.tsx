import React from 'react'
import noop from '$shared/utils/noop'
import FlyoutWithSearch from '$shared/components/FlyoutWithSearch/FlyoutWithSearch'
import DataListView from '$shared/components/DataListView/DataListView'
import HeadlessDataList from '$shared/components/HeadlessDataList/HeadlessDataList'

interface IProps {
  options: string[]
  onSelect: (item: string) => void
  close: () => void
  children?: (q: string) => React.ReactNode
  listStyle?: React.CSSProperties
}

interface IState {}

class FlyoutSearchableList extends React.PureComponent<IProps, IState> {
  render() {
    const {options, onSelect, close, listStyle} = this.props
    if (options.length === 0) return null
    return (
      <HeadlessDataList
        options={options}
        onCancel={close}
        onSelectOption={onSelect}
        onSelectNothing={noop}
      >
        {(onQuery, filteredOptions, focusedIndex, setFocusedIndexTo, query) => {
          const childrenToRender =
            this.props.children && this.props.children(query)

          return (
            <FlyoutWithSearch
              onClickOutside={close}
              onChange={onQuery}
              hideSearchBar={options.length === 1}
              style={listStyle}
            >
              {childrenToRender == null ? (
                <DataListView
                  dataList={filteredOptions}
                  focusedIndex={focusedIndex}
                  onFocus={setFocusedIndexTo}
                  onSelect={onSelect}
                />
              ) : (
                childrenToRender
              )}
            </FlyoutWithSearch>
          )
        }}
      </HeadlessDataList>
    )
  }
}

export default FlyoutSearchableList
