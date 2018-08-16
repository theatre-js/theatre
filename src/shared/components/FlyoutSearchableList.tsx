import React from 'react'
import HeadlessDataList from '$theater/common/components/HeadlessDataList/HeadlessDataList'
import noop from '$shared/utils/noop'
import FlyoutWithSearch from '$shared/components/FlyoutWithSearch/FlyoutWithSearch'
import DataListView from '$shared/components/DataListView/DataListView'

interface IProps {
  options: string[]
  onSelect: (item: string) => void
  close: () => void
  children?: (q: string) => React.ReactNode
}

interface IState {}

class FlyoutSearchableList extends React.PureComponent<IProps, IState> {
  render() {
    const {options, onSelect, close} = this.props
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
            <FlyoutWithSearch onClickOutside={close} onChange={onQuery}>
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
