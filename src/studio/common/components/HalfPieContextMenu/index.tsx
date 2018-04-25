import React from 'react'
import * as css from './index.css'
import cx from 'classnames'
import * as _ from 'lodash'

interface IProps {
  close: Function
  centerPoint: {left: number; top: number}
  placement: 'left' | 'right' | 'top' | 'bottom'
  items: Array<{
    label: string
    cb: Function
    IconComponent: $FixMe
    disabled?: boolean
  }>
}

interface IState {
  pressedKeyCode: number
}

const BOX_HEIGHT = 30

const getCoordinatesOnVerticalAxis = (
  placement: 'left' | 'right',
  numberOfItems: number,
  centerPointLeft: number,
  maxItemWidth: number,
) => {
  const halfOfItems = 0.5 * numberOfItems
  const halfOfItemsFloored = Math.floor(halfOfItems)
  const radius = halfOfItemsFloored * BOX_HEIGHT

  const {innerWidth} = window
  const menuEdge = centerPointLeft + maxItemWidth
  const isOutOfWindow = menuEdge > innerWidth
  const coeff = (isOutOfWindow ? -1 : 1) * (placement === 'left' ? -1 : 1)
  const leftCoeff =
    0.75 *
    (isOutOfWindow
      ? Math.pow(
          1 - (menuEdge + maxItemWidth - innerWidth) / (radius + maxItemWidth),
          3,
        )
      : 1)

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
    const topTranslate = index * BOX_HEIGHT - radius

    return {leftTranslate, topTranslate, leftCoeff, topCoeff: 0.5}
  }
}

const getCoordinatesOnHorizontalAxis = (
  placement: 'top' | 'bottom',
  numberOfItems: number,
  maxItemWidth: number,
) => {
  const halfOfItems = 0.5 * numberOfItems
  const halfOfItemsFloored = Math.floor(halfOfItems)
  const radiusY = halfOfItemsFloored * BOX_HEIGHT
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
      (halfOfItemsFloored - index) / halfOfItemsFloored * radiusY * 2.5
    if (
      numberOfItems % 2 === 0 &&
      (index === halfOfItems || index === halfOfItems - 1)
    ) {
      leftTranslate =
        (halfOfItemsFloored - index) / halfOfItemsFloored * radiusX * 0.7
    }
    return {leftTranslate, topTranslate, leftCoeff: 0.5, topCoeff: 0.5}
  }
}

class HalfPieContextMenu extends React.PureComponent<IProps, IState> {
  preparedLabels: $FixMe

  constructor(props: IProps) {
    super(props)

    this.preparedLabels = props.items.map(({label}: $FixMe) => {
      const openningSignIndex = label.indexOf('$')
      const closingSignIndex = label.lastIndexOf('$')
      const key = label.slice(openningSignIndex + 1, closingSignIndex)
      return {
        key,
        prefix: label.slice(0, openningSignIndex),
        suffix: label.slice(closingSignIndex + 1),
      }
    })

    this.state = {
      pressedKeyCode: -1,
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this._handleKeyDown)
    document.addEventListener('keyup', this._handleKeyUp)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._handleKeyDown)
    document.removeEventListener('keyup', this._handleKeyUp)
  }

  _handleKeyDown = (e: $FixMe) => {
    const pressedKeyCode = e.keyCode
    this.setState(() => ({pressedKeyCode}))
  }

  _handleKeyUp = () => {
    const {pressedKeyCode} = this.state
    const matchedItemIndex = this.preparedLabels.findIndex(({key}: $FixMe) => {
      return (
        key.toLowerCase() === String.fromCharCode(pressedKeyCode).toLowerCase()
      )
    })
    if (matchedItemIndex !== -1) {
      this.props.items[matchedItemIndex].cb()
      this.props.close()
    } else {
      this.setState(() => ({pressedKeyCode: -1}))
    }
  }

  render() {
    const {centerPoint, items, close, placement} = this.props
    const {pressedKeyCode} = this.state
    const maxItemWidth = Math.max(
      ..._.flatMap(items, (item: $FixMe) => 5 + item.label.length * 6),
    )
    const translateCalculatorFn =
      placement === 'left' || placement === 'right'
        ? getCoordinatesOnVerticalAxis(
            placement,
            items.length,
            centerPoint.left,
            maxItemWidth,
          )
        : getCoordinatesOnHorizontalAxis(placement, items.length, maxItemWidth)

    const {innerWidth, innerHeight} = window
    return (
      <div className={css.container} onMouseDown={() => close()}>
        {items.map(({cb, disabled, IconComponent}: $FixMe, index: number) => {
          const {
            leftTranslate,
            topTranslate,
            leftCoeff,
            topCoeff,
          } = translateCalculatorFn(index)
          const {key, suffix, prefix} = this.preparedLabels[index]
          return (
            <div
              key={index}
              className={cx(css.item, {
                [css.disabled]: disabled,
                [css.highlight]:
                  key.toLowerCase() ===
                  String.fromCharCode(pressedKeyCode).toLowerCase(),
              })}
              style={{
                right: innerWidth - centerPoint.left,
                bottom: innerHeight - centerPoint.top,
                '--left': leftTranslate,
                '--top': topTranslate,
                '--leftCoeff': leftCoeff,
                '--topCoeff': topCoeff,
              }}
              onMouseDown={() => {
                close()
                cb()
              }}
            >
              <span className={css.icon}>
                <IconComponent />
              </span>
              <span className={css.label}>
                {prefix}
                <span className={css.key}>{key}</span>
                {suffix}
              </span>
            </div>
          )
        })}
        <div
          className={css.anchor}
          style={{left: centerPoint.left, top: centerPoint.top}}
        />
      </div>
    )
  }
}

export default HalfPieContextMenu
