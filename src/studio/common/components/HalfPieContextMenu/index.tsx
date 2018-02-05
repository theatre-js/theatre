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
  centerPointLeft: number,
  maxItemWidth: number,
) => {
  const halfOfItems = 0.5 * numberOfItems
  const halfOfItemsFloored = Math.floor(halfOfItems)
  const radius = halfOfItemsFloored * 28

  const {innerWidth} = window
  const menuEdge = centerPointLeft + maxItemWidth
  const isOutOfWindow = menuEdge > innerWidth
  const coeff = (isOutOfWindow ? -1 : 1) * (placement === 'left' ? -1 : 1)
  const leftCoeff = (isOutOfWindow ? (1 - (menuEdge - innerWidth) / radius) : 1) * .5

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

    return {leftTranslate, topTranslate, leftCoeff, topCoeff: .5}
  }
}

const getCoordinatesOnHorizontalAxis = (
  placement: 'top' | 'bottom',
  numberOfItems: number,
  maxItemWidth: number,
) => {
  const halfOfItems = 0.5 * numberOfItems
  const halfOfItemsFloored = Math.floor(halfOfItems)
  const radiusY = halfOfItemsFloored * 28
  const radiusX = Math.ceil(halfOfItems) * maxItemWidth

  const coeff = placement === 'top' ? -1 : 1
  
  return (index: number) => {
    let topTranslate
    if (index < halfOfItems) {
      topTranslate = coeff * (index / halfOfItemsFloored) * radiusY
    } else {
      topTranslate =
        coeff * ((numberOfItems - 1 - index) / halfOfItemsFloored) * radiusY
    }
    let leftTranslate =
      (halfOfItemsFloored - index) / halfOfItemsFloored * radiusY * 1.3
    if (
      numberOfItems % 2 === 0 &&
      (index === halfOfItems || index === halfOfItems - 1)
    ) {
      leftTranslate =
        (halfOfItemsFloored - index) / halfOfItemsFloored * radiusX * .7
    }
    return {leftTranslate, topTranslate, leftCoeff: .5, topCoeff: .5}
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
        ? getCoordinatesOnVerticalAxis(placement, items.length, centerPoint.left, maxItemWidth)
        : getCoordinatesOnHorizontalAxis(placement, items.length, maxItemWidth)
    
    const {innerWidth, innerHeight} = window
    return (
      <div className={css.container} onClick={() => close()}>
        {items.map(({label, cb, disabled}: $FixMe, index: number) => {
          const {leftTranslate, topTranslate, leftCoeff, topCoeff} = translateCalculatorFn(index)
          return (
            <div
              key={index}
              className={cx(css.item, {[css.disabled]: disabled})}
              style={{
                right: innerWidth - centerPoint.left,
                bottom: innerHeight - centerPoint.top,
                '--left': leftTranslate,
                '--top': topTranslate,
                '--leftCoeff': leftCoeff,
                '--topCoeff': topCoeff,
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
