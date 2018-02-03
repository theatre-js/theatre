import {React} from '$studio/handy'
import css from './index.css'

class RadialContextMenu extends React.PureComponent<any, any> {
  render() {
    const {centerPoint, items, close} = this.props
    const numberOfItems = items.length
    const radius = numberOfItems * 15
    const topOffset = centerPoint.top - radius

    return (
      <div className={css.container} onClick={close}>
        {
          items.map(({label, cb}: $FixMe, index: number) => {
            let leftTranslate
            if (index <  .5 * numberOfItems){
              // left = centerPoint.left - (index / Math.floor(numberOfItems / 2)) * radius * .7
              leftTranslate = -(index / Math.floor(numberOfItems / 2)) * radius * .7
            } else {
              // left = centerPoint.left - ((numberOfItems - 1 - index) / Math.floor(numberOfItems / 2)) * radius * .7
              leftTranslate = -((numberOfItems - 1 - index) / Math.floor(numberOfItems / 2)) * radius * .7
            }
            const topTranslate = topOffset + (index * 30) - centerPoint.top
            
            return (
              <div
                key={index}
                className={css.item}
                // style={{left, top}}
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
          })
        }
      </div>
    )
  }
}

export default RadialContextMenu