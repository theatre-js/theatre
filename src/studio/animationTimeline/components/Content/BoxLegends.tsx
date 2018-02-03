import {React} from '$studio/handy'
import css from './BoxLegends.css'
import cx from 'classnames'

class BoxLegends extends React.PureComponent<$FixMe, $FixMe> {
  handleClick(e: $FixMe, laneId: string) {
    this.props.setActiveLane(laneId)
  }

  render() {
    const {lanes, colors, activeLaneId} = this.props
    return (
      <div className={css.container}>
        {lanes.map(({id, component, property}: $FixMe, index: number) => {
          return (
            <div
              key={id}
              className={css.legendItem}
              style={{'--color': colors[index % colors.length]}}
              onClick={(e: $FixMe) => this.handleClick(e, id)}
            >
              <div className={cx(css.legendBar, {[css.isActive]: activeLaneId === id})} />
              <div className={css.legendText}>
                <span className={css.component}>{component}</span>
                <span className={css.separator}>&nbsp;/&nbsp;</span>
                <span className={css.property}>{property}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}

export default BoxLegends
