import {label} from '$studio/structuralEditor/components/reusables/PanelSection.css'
import {IComponentId} from '$studio/componentModel/types'
import TheatreComponent from '$studio/componentModel/react/TheatreComponent/TheatreComponent'
import {
  DerivedClass,
  Classify,
} from '$shared/DataVerse/deprecated/derivedClass/derivedClass'
import constructValue from './constructValue/constructValue'

const cache = new Map<IComponentId, DeclarativeComponentBaseClass>()

const getOrCreateClassForDeclarativeComponentId = (id: IComponentId) => {
  if (cache.has(id)) {
    return cache.get(id)
  } else {
    const cls = createClass(id)
    cache.set(id, cls)
    return cls
  }
}

export default getOrCreateClassForDeclarativeComponentId

const createClass = (id: IComponentId) => {
  const cls = class extends DeclarativeComponentBaseClass {
    static componentId = id
  }
  return cls
}

const methods: Classify<$FixMe, $FixMe> = {
  timelineDescriptors(self: $FixMe) {
    const componentDescriptorP = self.prop('componentDescriptor')

    return componentDescriptorP.prop('timelineDescriptors').prop('byId')
  },

  render(self: $FixMe) {
    // debugger
    const componentDescriptorP = self.prop('componentDescriptor')

    const whatToRenderP = componentDescriptorP.prop('whatToRender')
    return whatToRenderP.flatMap((v: $FixMe) => constructValue(v, self))
    // return constructValue(whatToRenderP, self)
  },
}

class DeclarativeComponentBaseClass extends TheatreComponent<{}> {
  static displayName = 'DeclarativeComponent'
  static componentType = 'Declarative'

  _getClass(baseClass) {
    return baseClass.extend(methods)
  }
}
