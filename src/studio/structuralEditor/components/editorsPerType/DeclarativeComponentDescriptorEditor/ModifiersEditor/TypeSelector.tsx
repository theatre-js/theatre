import {React} from '$studio/handy'
import css from './TypeSelector.css'
import HeadlessDataList from '$studio/common/components/HeadlessDataList/HeadlessDataList'

interface IProps {
  left: number
  top: number
  width: number
  height: number
}

interface IState {}

class TypeSelector extends React.PureComponent<IProps, IState> {
  render() {
    const {left, top, width, height} = this.props
    const style = {
      '--left': left,
      '--top': top,
      '--width': width,
      '--height': height,
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
        onSelect={(index, option) => console.log('selected: ', index, option)}
        onClickOutside={() => console.log('clicked outside')}
      >
        {(onQuery, filteredOptions, focusedIndex) => {
          return (
            <>
              <div className={css.inputContainer} style={style}>
                <input type="text" onChange={e => onQuery(e.target.value)} />
              </div>
              <div className={css.listContainer} style={style}>
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
