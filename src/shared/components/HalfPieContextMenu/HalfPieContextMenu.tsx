import React from 'react'
import css from './HalfPieContextMenu.css'
import {flatMap} from 'lodash-es'
import Overlay from '$shared/components/Overlay/Overlay'
import OverlaySection from '$shared/components/Overlay/OverlaySection'
import resolveCss from '$shared/utils/resolveCss'
import FixedFullSizeContainer from '$shared/components/FixedFullSizeContainer/FixedFullSizeContainer'

const classes = resolveCss(css)

interface IProps {
  close: () => void
  centerPoint: {left: number; top: number}
  placement: 'left' | 'right' | 'top' | 'bottom'
  renderInPortal?: boolean
  items: Array<{
    label: string
    cb: () => void
    IconComponent: React.ReactNode
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
      ((halfOfItemsFloored - index) / halfOfItemsFloored) * radiusY * 2.5
    if (
      numberOfItems % 2 === 0 &&
      (index === halfOfItems || index === halfOfItems - 1)
    ) {
      leftTranslate =
        ((halfOfItemsFloored - index) / halfOfItemsFloored) * radiusX * 0.7
    }
    return {leftTranslate, topTranslate, leftCoeff: 0.5, topCoeff: 0.5}
  }
}

class HalfPieContextMenu extends React.PureComponent<IProps, IState> {
  static defaultProps = {
    renderInPortal: true,
  }

  preparedLabels: {
    key: string
    prefix: string
    suffix: string
  }[]

  constructor(props: IProps) {
    super(props)

    this.preparedLabels = props.items.map(({label}) => {
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

  render() {
    const {centerPoint, items, close, placement, renderInPortal} = this.props
    const {pressedKeyCode} = this.state
    const maxItemWidth = Math.max(
      ...flatMap(items, (item: $FixMe) => 5 + item.label.length * 6),
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
      <FixedFullSizeContainer usePortal={renderInPortal}>
        <Overlay onClickOutside={close}>
          {items.map(({cb, disabled, IconComponent}: $FixMe, index: number) => {
            const {
              leftTranslate,
              topTranslate,
              leftCoeff,
              topCoeff,
            } = translateCalculatorFn(index)
            const {key, suffix, prefix} = this.preparedLabels[index]
            const shouldHighlight =
              !disabled &&
              key.toLowerCase() ===
                String.fromCharCode(pressedKeyCode).toLowerCase()
            return (
              <OverlaySection
                key={index}
                {...classes(
                  'item',
                  disabled && 'disabled',
                  shouldHighlight && 'highlight',
                )}
                style={{
                  right: innerWidth - centerPoint.left,
                  bottom: innerHeight - centerPoint.top,
                  // @ts-ignore ignore
                  '--left': leftTranslate,
                  '--top': topTranslate,
                  '--leftCoeff': leftCoeff,
                  '--topCoeff': topCoeff,
                }}
                onClick={cb}
              >
                <span className={css.icon}>
                  <IconComponent />
                </span>
                <span className={css.label}>
                  {prefix}
                  <span className={css.key}>{key}</span>
                  {suffix}
                </span>
              </OverlaySection>
            )
          })}
          <OverlaySection>
            <div
              className={css.anchor}
              style={{left: centerPoint.left, top: centerPoint.top}}
            />
          </OverlaySection>
        </Overlay>
      </FixedFullSizeContainer>
    )
  }

  componentDidMount() {
    document.addEventListener('keydown', this._handleKeyDown)
    document.addEventListener('keyup', this._handleKeyUp)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._handleKeyDown)
    document.removeEventListener('keyup', this._handleKeyUp)
  }

  _handleKeyDown = (e: KeyboardEvent) => {
    const pressedKeyCode = e.keyCode
    // esc
    if (e.keyCode === 27) {
      this.props.close()
      return
    }

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
      const item = this.props.items[matchedItemIndex]
      if (item.disabled == null || !item.disabled) {
        this.props.items[matchedItemIndex].cb()
      }
      this.props.close()
    } else {
      this.setState(() => ({pressedKeyCode: -1}))
    }
  }
}

export default HalfPieContextMenu
