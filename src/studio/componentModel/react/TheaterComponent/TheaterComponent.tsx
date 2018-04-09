import {DerivedClass} from '$shared//DataVerse/derivedClass/derivedClass'
import dictAtom, {DictAtom} from '$shared/DataVerse/atoms/dictAtom'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import AbstractDerivedArray from '$shared/DataVerse/derivations/arrays/AbstractDerivedArray'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import constant from '$shared/DataVerse/derivations/constant'
import AbstractDerivedDict, {
  DerivedDictTypeOf,
} from '$shared/DataVerse/derivations/dicts/AbstractDerivedDict'
import emptyDict from '$shared/DataVerse/derivations/dicts/emptyDict'
import derivedClass, {
  Classify,
} from '$shared/DataVerse/derivedClass/derivedClass'
import DerivedClassInstance from '$shared/DataVerse/derivedClass/DerivedClassInstance'
import SideEffectsHandler from '$src/studio/componentModel/react/TheaterComponent/SideEffectsHandler'
import TimelinesHandler from '$src/studio/componentModel/react/TheaterComponent/TimelinesHandler'
import {PureComponentWithStudio, Studio} from '$src/studio/handy'
import {StudioStateAtom} from '$studio/bootstrap/Studio'
import {isCoreComponent} from '$studio/componentModel/selectors'
import {ComponentId} from '$studio/componentModel/types'

type WrapProps<Props> = {
  key: string
  props: Props
  modifierInstantiationDescriptors: $FixMe
}

type TheAtom<Props> = DictAtom<{
  instanceId: number
  componentInstance: TheaterComponent<Props>
  props: Props
  modifierInstantiationDescriptors: $FixMe
  studio: Studio
  state: $FixMe
  timelineInstances: DictAtom<$FixMe>
}>

type BaseClass<Props> = Classify<
  {_atom: TheAtom<Props>},
  {
    render: React.ReactNode
    sideEffects: AbstractDerivedDict<$FixMe>
    props: Props
    studio: Studio
    studioAtom: DerivedDictTypeOf<StudioStateAtom>
    modifierInstantiationDescriptors: $FixMe
    state: $FixMe
    timelineDescriptors: AbstractDerivedDict<{[key: string]: $FixMe}>
    timelineInstances: DictAtom<$FixMe>
    componentInstance: TheaterComponent<Props>
    componentId: ComponentId
    componentDescriptor: $FixMe
  }
>

export default abstract class TheaterComponent<
  Props
> extends PureComponentWithStudio<WrapProps<Props>, {}> {
  static isTheaterJSComponent = true
  static componentId: string

  _derivedClassInstance: $FixMe
  _whatToRender: $FixMe
  _fnsToCallOnWillUnmount: Array<() => void>
  _derivedClassD: AbstractDerivation<DerivedClass<BaseClass<Props>>>
  _sideEffetsHandler: SideEffectsHandler
  isTheaterJSComponent: boolean
  componentType: undefined | string
  componentId: undefined | string
  elementId: number
  _timelinesHandler: TimelinesHandler
  _atom: TheAtom<Props>

  abstract _getClass(
    baseClass: DerivedClass<BaseClass<Props>>,
  ): DerivedClass<BaseClass<Props>>

  static _baseClassMethods: BaseClass<$IntentionalAny> = {
    render: () => null,

    sideEffects: () => emptyDict,

    props: self => self.prop('_atom').prop('props'),

    studio: self => self.prop('_atom').prop('studio'),

    studioAtom: self =>
      self.prop('studio').map((studio: Studio) => studio.atom.derivedDict()),

    modifierInstantiationDescriptors: self =>
      self.prop('_atom').prop('modifierInstantiationDescriptors'),

    state: self => self.prop('_atom').prop('state'),

    timelineDescriptors: () => emptyDict,

    timelineInstances: (self: $FixMe) =>
      self.prop('_atom').prop('timelineInstances'),

    componentId(self) {
      const instanceD = self.prop('componentInstance')
      return autoDerive(() => {
        return (instanceD.getValue().constructor as $IntentionalAny).componentId
      })
    },

    componentInstance(self) {
      return self.prop('_atom').prop('componentInstance')
    },

    componentDescriptor(self) {
      const idP = self.prop('componentId')
      return autoDerive(() => {
        const componentId = idP.getValue()
        const atomP = self.prop('studioAtom')
        const isCore = isCoreComponent(componentId)

        return isCore
          ? atomP
              .prop('ahistoricComponentModel')
              .prop('coreComponentDescriptors')
              .prop(componentId)
          : atomP
              .prop('historicComponentModel')
              .prop('customComponentDescriptors')
              .prop(componentId)
      })
    },
  }
  constructor(props: WrapProps<Props>, context: $IntentionalAny) {
    super(props, context)

    this._fnsToCallOnWillUnmount = []

    this._atom = this._createAtom()

    this._derivedClassD = this._makeDerivedClassD()

    const untapFromDerivedClassDChanges = this._derivedClassD
      .changes(this.studio.ticker)
      .tap(newFinalDerivedClass => {
        this._derivedClassInstance.setClass(newFinalDerivedClass)
      })

    this._fnsToCallOnWillUnmount.push(untapFromDerivedClassDChanges)

    this._derivedClassInstance = new DerivedClassInstance(
      this._derivedClassD.getValue(),
      this.studio.ticker,
    )

    this.isTheaterJSComponent = true

    // debug.skipFindingColdDerivations()

    // if (!displayName)
    //   TheaterJSComponent.displayName = this._finalFace
    //     .prop('displayName')
    //     .getValue()

    // debug.endSkippingColdDerivations()

    this.elementId = this._atom.prop('instanceId')

    this._whatToRender = null
    const untapFromRender = this._derivedClassInstance
      .prop('render')
      .changes(this.studio.ticker)
      .tap((whatToRender: $FixMe) => {
        this._whatToRender = whatToRender
        this.forceUpdate()
      })

    this._fnsToCallOnWillUnmount.push(untapFromRender)

    const sideEffectsDictP = this._derivedClassInstance
      .pointer()
      .prop('sideEffects')

    this._sideEffetsHandler = new SideEffectsHandler(
      this.studio.ticker,
      this._derivedClassInstance,
      sideEffectsDictP,
    )

    this._timelinesHandler = new TimelinesHandler(this as $IntentionalAny)
    this._timelinesHandler.start()

    this.studio.declareComponentInstance(this.elementId, this as $FixMe)

    // if (this.getComponentId() === 'BouncyBall') {
    //   this.reduceState(
    //     [
    //       'workspace',
    //       'panels',
    //       'byId',
    //       '8daa7380-9b43-475a-8352-dc564a58c719',
    //       'configuration',
    //       'elementId',
    //     ],
    //     () => this.elementId,
    //   )
    // }

    // if (this.getComponentId() === '')
  }

  getComponentId() {
    return (this.constructor as $IntentionalAny).componentId
  }

  _getInitialState(): DictAtom<{}> {
    return dictAtom({})
  }

  // getComponentId() {
  //   if (componentType === 'Declarative') {
  //     // throw Error('implement me')
  //     return this.props.componentId
  //   } else {
  //     return componentId
  //   }
  // }

  _createAtom(): TheAtom<Props> {
    return dictAtom({
      instanceId: this.studio._getNewComponentInstanceId(),
      componentInstance: this,
      props: this.props.props,
      modifierInstantiationDescriptors: this.props
        .modifierInstantiationDescriptors,
      studio: this.studio,
      // key: this.props.key,
      state: this._getInitialState(),
      timelineInstances: dictAtom({}),
    })
  }

  _makeDerivedClassD() {
    const baseDerivedClass = derivedClass({_atom: () => this._atom}).extend(
      TheaterComponent._baseClassMethods,
    )

    const derivedClassWithoutModifiers = this._getClass(baseDerivedClass)

    const modifierInstantiationDescriptorsByIdP = this._atom
      .pointer()
      .prop('modifierInstantiationDescriptors')
      // @ts-ignore @todo
      .prop('byId')

    const finalDerivedClassD = this._atom
      .pointer()
      .prop('modifierInstantiationDescriptors')
      // @ts-ignore @todo
      .prop('list')
      .flatMap((list: AbstractDerivedArray<$FixMe>) => {
        if (!list) return derivedClassWithoutModifiers

        return (
          list
            // @ts-ignore @todo
            .map((id: string) => modifierInstantiationDescriptorsByIdP.prop(id))
            // @ts-ignore @todo
            .reduce((dict, modifierInstantiationDescriptor) => {
              return this._applyModifier(modifierInstantiationDescriptor, dict)
            }, constant(derivedClassWithoutModifiers))
        )
      })

    return finalDerivedClassD
  }

  _applyModifier(
    // @ts-ignore @todo
    modifierInstantiationDescriptor,
    // @ts-ignore @todo
    dict,
  ): AbstractDerivation<$FixMe> {
    return modifierInstantiationDescriptor
      .prop('disabled')
      .flatMap((disabled: boolean) => {
        if (disabled) return dict

        return modifierInstantiationDescriptor
          .prop('modifierId')
          .flatMap((modifierId: string) => {
            return this.studio.atom
              .pointer()
              .prop('ahistoricComponentModel')
              .prop('coreModifierDescriptors')
              .prop(modifierId)
              .prop('getClass')
              .flatMap((possibleFn: undefined | null | Function) => {
                if (!possibleFn)
                  console.warn(
                    `couldn't find modifier '${modifierId}'. This should never happen`,
                  )
                return possibleFn
                  ? possibleFn(
                      modifierInstantiationDescriptor.pointer().prop('props'),
                      dict,
                    )
                  : dict
              })
          })
      })
  }

  componentWillReceiveProps(newProps: WrapProps<Props>) {
    if (newProps.props !== this.props.props) {
      this._atom.setProp('props', newProps.props)
    }

    if (
      newProps.modifierInstantiationDescriptors !==
      this.props.modifierInstantiationDescriptors
    ) {
      this._atom.setProp(
        'modifierInstantiationDescriptors',
        newProps.modifierInstantiationDescriptors,
      )
    }
  }

  componentWillMount() {
    // debugger
    this._whatToRender = this._derivedClassInstance.prop('render').getValue()
    // this._finalFace.prop('componentWillMountCallbacks').getValue().face().forEach((fn) => fn(this._finalFace))
  }

  componentDidMount() {
    this._sideEffetsHandler.startAppying()
  }

  componentWillUnmount() {
    this._sideEffetsHandler.stopApplying()
    this._fnsToCallOnWillUnmount.forEach(fn => {
      fn()
    })
    this.studio.undeclareComponentInstance(this.elementId)
  }

  render() {
    return this._whatToRender
  }

  getTimelineInstance(timelineId: string) {
    return this._atom.prop('timelineInstances').prop(timelineId)
  }
}

export const isTheaterComponent = (s: mixed): s is TheaterComponent<mixed> =>
  // @ts-ignore @ignore
  s && s.isTheaterJSComponent === true
