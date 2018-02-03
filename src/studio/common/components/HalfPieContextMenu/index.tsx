import {React} from '$studio/handy'
import css from './index.css'
import cx from 'classnames'
import * as _ from 'lodash'

interface IProps {
  close: Function
  centerPoint: {left: number, top: number}
  placement: 'left' | 'right' | 'top' | 'bottom'
  items: Array<{label: string, cb: Function, disabled?: boolean}>
}

interface IState {}

const getCoordinatesOnVerticalAxis = (
  placement: 'left' | 'right',
  numberOfItems: number,
) => {
  const coeff = placement === 'left' ? -1 : 1
  const halfOfItems = 0.5 * numberOfItems
  const halfOfItemsFloored = Math.floor(halfOfItems)
  const radius = halfOfItemsFloored * 28

  return (index: number) => {
    let leftTranslate
    if (index < halfOfItems) {
      leftTranslate = coeff * (index / halfOfItemsFloored) * radius * 0.7
    } else {
      leftTranslate =
        coeff *
        ((numberOfItems - 1 - index) / halfOfItemsFloored) *
        radius *
        0.7
    }
    const topTranslate = index * 28 - radius

    return {leftTranslate, topTranslate}
  }
}

const getCoordinatesOnHorizontalAxis = (
  placement: 'top' | 'bottom',
  numberOfItems: number,
  maxItemWidth: number,
) => {
  const coeff = placement === 'top' ? -1 : 1
  const halfOfItems = 0.5 * numberOfItems
  const halfOfItemsFloored = Math.floor(halfOfItems)
  const radiusY = halfOfItemsFloored * 28
  const radiusX = Math.ceil(halfOfItems) * maxItemWidth
  return (index: number) => {
    let topTranslate
    if (index < halfOfItems) {
      topTranslate = coeff * (index / halfOfItemsFloored) * radiusY
    } else {
      topTranslate =
        coeff * ((numberOfItems - 1 - index) / halfOfItemsFloored) * radiusY
    }
    let leftTranslate =
      (halfOfItemsFloored - index) / halfOfItemsFloored * radiusY
    if (
      numberOfItems % 2 === 0 &&
      (index === halfOfItems || index === halfOfItems - 1)
    ) {
      leftTranslate =
        (halfOfItemsFloored - index) / halfOfItemsFloored * radiusX * 0.7
    }
    return {leftTranslate, topTranslate}
  }
}

class HalfPieContextMenu extends React.PureComponent<IProps, IState> {
  render() {
    const {centerPoint, items, close, placement} = this.props
    const maxItemWidth = Math.max(
      ..._.flatMap(items, (item: $FixMe) => 5 + item.label.length * 8.5),
    )
    const translateCalculatorFn =
      placement === 'left' || placement === 'right'
        ? getCoordinatesOnVerticalAxis(placement, items.length)
        : getCoordinatesOnHorizontalAxis(placement, items.length, maxItemWidth)

    return (
      <div className={css.container} onClick={() => close()}>
        {items.map(({label, cb, disabled}: $FixMe, index: number) => {
          const {leftTranslate, topTranslate} = translateCalculatorFn(index)
          return (
            <div
              key={index}
              className={cx(css.item, {[css.disabled]: disabled})}
              style={{
                left: centerPoint.left,
                top: centerPoint.top,
                '--left': leftTranslate,
                '--top': topTranslate,
              }}
              onClick={cb}
            >
              {label}
            </div>
          )
        })}
      </div>
    )
  }
}

export default HalfPieContextMenu
