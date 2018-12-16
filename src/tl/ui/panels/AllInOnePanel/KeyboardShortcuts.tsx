import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import {Pointer} from '$shared/DataVerse/pointer'
import {val, coldVal} from '$shared/DataVerse/atom'
import {TimeStuff} from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider'
import {ITimeStuff} from './TimeStuffProvider'

interface IProps {}

interface IState {}

export default class KeyboardShortcuts extends UIComponent<IProps, IState> {
  timeStuffP: Pointer<ITimeStuff>
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    return (
      <TimeStuff>
        {timeStuffP => {
          this.timeStuffP = timeStuffP
          return null
        }}
      </TimeStuff>
    )
  }

  componentWillMount() {
    window.addEventListener('keydown', this._handleKeyDown)
  }

  _handleKeyDown = (e: KeyboardEvent) => {
    if (e.target && (e.target as HTMLElement).tagName === 'INPUT') {
      return
    }

    if (e.key === ' ') {
      this.togglePlay()
    } else {
      return
    }

    e.preventDefault()
    e.stopPropagation()
  }

  togglePlay() {
    const timeStuff = coldVal(this.timeStuffP)
    const {timelineInstance, timelineTemplate} = timeStuff

    if (timelineInstance) {
      if (timelineInstance.playing) {
        timelineInstance.pause()
      } else {
        const range = val(
          this.ui._selectors.historic.getTemporaryPlaybackRangeLimit(
            this.ui.atomP.historic,
            timelineTemplate.address,
          ),
        )
        if (
          !range ||
          timelineInstance.time < range.from - 100 ||
          timelineInstance.time > range.to + 100
        ) {
          timelineInstance.play({
            iterationCount: Infinity,
          })
        } else {
          timelineInstance.play({
            iterationCount: Infinity,
            range: range,
            // rate: 0.5
          })
        }
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this._handleKeyDown)
  }
}
