import React from 'react'
import ReactiveComponentWithTheater from '$theater/componentModel/react/utils/ReactiveComponentWithStudio'
import {val} from '$shared/DataVerse2/atom'
import * as css from './Viewports.css'
import resolveCss from '$shared/utils/resolveCss'
import {map} from 'lodash'
import Viewport from './Viewport'
import {reduceHistoricState} from '$theater/bootstrap/actions'

const classes = resolveCss(css)

interface IProps {}

interface IState {}

export default class Viewports extends ReactiveComponentWithTheater<
  IProps,
  IState
> {
  _setNoViewportAsActive = () => {
    console.log('hi');
    
    this.dispatch(
      reduceHistoricState(
        ['historicWorkspace', 'viewports', 'activeViewportId'],
        () => undefined,
      ),
    )
  }
  _render() {
    // @todo use keys()
    const viewports = val(this.theaterAtom2P.historicWorkspace.viewports.byId)
    const viewportEls = map(viewports, s => {
      return <Viewport key={s.id} id={s.id} />
    })

    return (
      <div {...classes('container')}>
        <div {...classes('viewports')}>{viewportEls}</div>
        <div {...classes('background')} onClick={this._setNoViewportAsActive} />
      </div>
    )
  }
}
