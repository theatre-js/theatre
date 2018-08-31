import TheaterComponent from '$theater/componentModel/react/TheaterComponent/TheaterComponent'
import noop from '$shared/utils/noop'
import TimelineInstance from './TimelineInstance/TimelineInstance'
import {getPathToComponentDescriptor} from '$theater/componentModel/selectors'
import autoProxyDerivedDict from '$shared/DataVerse/derivations/dicts/autoProxyDerivedDict'

export default class TimelinesHandler {
  _element: TheaterComponent<$IntentionalAny>
  _untap: () => void
  _timelineDescriptorsP: $FixMe
  _timelineDescriptorsProxy: $FixMe
  _timelineInstancesAtom: $FixMe

  constructor(element: TheaterComponent<$IntentionalAny>) {
    this._element = element
    this._timelineInstancesAtom = this._element._atom.prop('timelineInstances')

    this._timelineDescriptorsP = this._element._derivedClassInstance
      .pointer()
      .prop('timelineDescriptors')

    this._timelineDescriptorsProxy = autoProxyDerivedDict(
      this._timelineDescriptorsP,
      this._element.theater.ticker,
    )

    this._untap = noop
  }

  start() {
    this._untap = this._timelineDescriptorsProxy.changes().tap(changes => {
      changes.deletedKeys.forEach(this._removeKey)
      changes.addedKeys.forEach(this._startKey)
    })

    this._timelineDescriptorsProxy.keys().forEach(this._startKey)
  }

  _startKey = (key: string) => {
    this._timelineInstancesAtom.setProp(
      key,
      new TimelineInstance(
        this._timelineDescriptorsProxy.pointer().prop(key),
        this._element.theater,
        [
          ...getPathToComponentDescriptor(this._element.getComponentId()),
          'timelineDescriptors',
          'byId',
          key,
        ],
      ),
    )
  }

  _removeKey = (key: string) => {
    const timelineInstance = this._timelineInstancesAtom.prop(key)
    timelineInstance.destroy()
    this._timelineInstancesAtom.deleteProp(key)
  }
}
