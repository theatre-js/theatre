import {React} from '$studio/handy'
import css from './TypeSelector.css'
import HeadlessDataList from '$studio/common/components/HeadlessDataList/HeadlessDataList'

interface IProps {}

interface IState {}

class TypeSelector extends React.PureComponent<IProps, IState> {
  render() {
    return (
      <HeadlessDataList
        options={['apple', 'apricot', 'banana', 'orange', 'pear']}
        onClickOutside={() => console.log('clicked outside')}
      >
        {(onQuery, filteredOptions, focusedIndex) => {
          return (
            <>
              <div className={css.input}>
                <input type="text" onChange={e => onQuery(e.target.value)} />
              </div>
              <div className={css.list}>
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
