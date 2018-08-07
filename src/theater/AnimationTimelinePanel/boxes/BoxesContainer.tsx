import React from 'react'
import {
  TimelineObject,
  LayoutArray,
} from '$theater/AnimationTimelinePanel/types'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import css from './BoxesContainer.css'
import resolveCss from '$shared/utils/resolveCss'
import {get} from 'lodash'
import BoxView from '$theater/AnimationTimelinePanel/boxes/BoxView'
import memoizeOne from 'memoize-one'
import {Broadcast, Subscriber} from 'react-broadcast'
import {
  TBoxDnDAPI,
  TBoxDnDState,
} from '$theater/AnimationTimelinePanel/boxes/types'
import {
  RootPropGetterChannel,
  TPropGetter,
} from '$theater/AnimationTimelinePanel/RootPropProvider'
import {reduceHistoricState} from '$theater/bootstrap/actions'
import boxWrapperCss from './BoxWrapper.css'
import immer from 'immer'
import PureComponentWithTheater from '$theater/handy/PureComponentWithTheater'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'

const classes = resolveCss(css)

interface IProps {
  pathToTimeline: string[]
}

interface IState extends TBoxDnDState {}

export const BoxDnDAPIChannel = 'TheaterJS/BoxDnDAPIChannel'
export const BoxDnDStateChannel = 'TheaterJS/BoxDnDStateChannel'

class BoxesContainer extends PureComponentWithTheater<IProps, IState> {
  dropZone: HTMLDivElement | null

  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)

    this.state = {
      status: 'noDnD',
      grabProps: null,
      dropProps: null,
    }
  }

  componentDidMount() {
    document.addEventListener('animationend', this.animationEndHandler)
  }

  componentWillUnmount() {
    document.removeEventListener('animationend', this.animationEndHandler)
  }

  render() {
    return (
      <PropsAsPointer props={this.props} state={this.state}>
        {({props, state}) => {
          const pathToTimeline = val(props.pathToTimeline)
          const timeline: Pointer<TimelineObject> = get(
            this.theater.atom2.pointer,
            pathToTimeline,
          )
          const layout = val(timeline.layout)
          const isGrabbed = val(state.status) === 'grab'
          return (
            <div {...classes('container')}>
              <Broadcast channel={BoxDnDAPIChannel} value={this.boxDnDAPI}>
                <Broadcast channel={BoxDnDStateChannel} value={val(state)}>
                  <>
                    {this._renderBoxViews(layout, pathToTimeline)}
                    {this._renderDropZone(isGrabbed)}
                  </>
                </Broadcast>
              </Broadcast>
            </div>
          )
        }}
      </PropsAsPointer>
    )
  }

  animationEndHandler = (e: AnimationEvent) => {
    if (
      e.animationName === boxWrapperCss.containerMove &&
      this.state.status === 'move'
    ) {
      this._move()
    }
    if (
      e.animationName === boxWrapperCss.containerMerge &&
      this.state.status === 'merge'
    ) {
      this._merge()
    }
  }

  grab: TBoxDnDAPI['grab'] = (index, height, top, isDopesheet) => {
    this.setState(() => ({
      status: 'grab',
      grabProps: {index, height, top, isDopesheet},
    }))
  }

  move: TBoxDnDAPI['move'] = (index, top) => {
    this.setState(() => ({
      status: 'move',
      dropProps: {index, top},
    }))
  }

  _move() {
    const {grabProps, dropProps} = this.state
    const sourceIndex = grabProps!.index
    let targetIndex = dropProps!.index
    this.dispatch(
      reduceHistoricState(
        [...this.props.pathToTimeline, 'layout'],
        (layout: LayoutArray): LayoutArray => {
          if (sourceIndex < targetIndex) --targetIndex
          if (sourceIndex === targetIndex) return layout
          layout.splice(targetIndex, 0, layout.splice(sourceIndex, 1)[0])
          return layout
        },
      ),
    )
    this._clearState()
  }

  merge: TBoxDnDAPI['merge'] = (index, height, top, isDopesheet) => {
    let mergeImmediately: boolean
    this.setState(
      ({grabProps, status}) => {
        mergeImmediately = grabProps!.isDopesheet || isDopesheet
        return {
          status: mergeImmediately ? status : 'merge',
          dropProps: {index, top, height},
        }
      },
      () => {
        if (mergeImmediately) this._merge()
      },
    )
  }

  _merge() {
    let sourceId: string, targetId: string
    const {grabProps, dropProps} = this.state
    const sourceIndex = grabProps!.index
    const targetIndex = dropProps!.index
    this.dispatch(
      reduceHistoricState(
        [...this.props.pathToTimeline],
        (timeline: TimelineObject): TimelineObject => {
          return immer(timeline, t => {
            const {layout, boxes} = t
            sourceId = layout[sourceIndex]
            targetId = layout[targetIndex]

            t.layout = [
              ...layout.slice(0, sourceIndex),
              ...layout.slice(sourceIndex + 1),
            ]

            const {[sourceId]: mergedBox, ...newBoxes} = boxes
            newBoxes[targetId].variables = newBoxes[targetId].variables.concat(
              mergedBox.variables,
            )
            t.boxes = newBoxes

            return t
          })
        },
      ),
    )
    this._clearState()
  }

  _clearState = () => {
    this.setState(() => ({
      status: 'noDnD',
      grabProps: null,
      dropProps: null,
    }))
  }

  _moveToEnd = () => {
    const layout: LayoutArray = val(get(this.theater.atom2.pointer, [
      ...this.props.pathToTimeline,
      'layout',
    ]) as Pointer<LayoutArray>)
    this.move(layout.length, this.dropZone!.getBoundingClientRect().top)
  }

  boxDnDAPI: TBoxDnDAPI = {
    grab: this.grab,
    move: this.move,
    merge: this.merge,
  }

  _renderBoxViews = memoizeOne(
    (layout: LayoutArray, pathToTimeline: string[]) => {
      return layout.map((id, index) => (
        <BoxView
          key={id}
          boxIndex={index}
          boxId={id}
          pathToTimeline={pathToTimeline}
        />
      ))
    },
  )

  _renderDropZone = memoizeOne((isGrabbed: boolean) => {
    return isGrabbed ? (
      <Subscriber channel={RootPropGetterChannel}>
        {(propGetter: TPropGetter) => {
          const width = propGetter('panelWidth')
          const minHeight = this.state.grabProps!.height
          return (
            <div
              ref={c => (this.dropZone = c)}
              {...classes('dropZone')}
              style={{width, minHeight}}
              onMouseUp={this._moveToEnd}
            />
          )
        }}
      </Subscriber>
    ) : null
  })
}

export default BoxesContainer
