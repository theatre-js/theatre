// @flow
import SideEffectsHandler from './SideEffectsHandler'
import {type Studio, PureComponentWithStudio, D} from '$studio/handy'

type MakeReactiveComponentArgs = {
  modifyPrototypalDict: (D.IPrototypalDict<$FixMe>) => D.IPrototypalDict<$FixMe>,
  displayName: ?string,
  componentId: ?string,
  componentType: ?string,
  getInitialState?: () => D.IDictAtom<$FixMe>,
}

export default function makeReactiveComponent({modifyPrototypalDict, displayName, getInitialState, componentId, componentType}: MakeReactiveComponentArgs) {
  type Props = {
    key: string,
    props: $FixMe,
    modifierInstantiationDescriptors: $FixMe,
  }

  class TheaterJSComponent extends PureComponentWithStudio<Props, void> {
    static displayName = displayName ? displayName : undefined
    _finalFace: $FixMe
    _atom: $FixMe
    _whatToRender: $FixMe
    _fnsToCallOnWillUnmount: Array<() => void>
    _prototypalDictD: D.IDerivation<$FixMe>
    _sideEffetsHandler: SideEffectsHandler

    _atom: D.IDictAtom<{
      instanceId: string | number,
      props: $ElementType<Props, 'props'>,
      studio: Studio,
      key: string,
      state: $FixMe,
      modifierInstantiationDescriptors: $ElementType<Props, 'modifierInstantiationDescriptors'>,
    }>

    static _baseLookupTable = {
      render() {
        return null
      },
      sideEffects: () => D.derivations.emptyDict,
      props: (d) => d.pointer().prop('_atom').prop('props'),
      studio: (d) => d.pointer().prop('_atom').prop('studio'),
      // dataVerseContext: (d) => d.pointer().prop('studio').getValue().dataVerseContext,
      // key: (d) => d.pointer().prop('_atom').prop('key'),
      modifierInstantiationDescriptors: (d) => d.pointer().prop('_atom').prop('modifierInstantiationDescriptors'),
      state: (d) => d.pointer().prop('_atom').prop('state'),
    }

    constructor(props: Props, context) {
      super(props, context)

      this._fnsToCallOnWillUnmount = []

      this._atom = this._createAtom()
      this._prototypalDictD = this._makePrototypalDictD()

      this._finalFace =
        new D.derivations.PrototypalDictFace(this._prototypalDictD.getValue(), this.studio.dataverseContext)

      this.isTheaterJSComponent = true
      this.componentType = componentType || this._finalFace.prop('componentType').getValue()
      this.componentId = componentId || this._finalFace.prop('componentId').getValue()
      this.elementId = this._atom.prop('instanceId')

      if (!displayName)
        TheaterJSComponent.displayName = this._finalFace.prop('displayName').getValue()

      const untapFromPrototypalMapChanges = this._prototypalDictD.setDataVerseContext(this.studio.dataverseContext).changes().tap((newFinalPrototypalDict) => {
        this._finalFace.setHead(newFinalPrototypalDict)
      })

      this._fnsToCallOnWillUnmount.push(untapFromPrototypalMapChanges)

      this._whatToRender = null
      const untapFromRender = this._finalFace.prop('render').setDataVerseContext(this.studio.dataverseContext).changes().tap((whatToRender) => {
        this._whatToRender = whatToRender
        this.forceUpdate()
      })
      this._fnsToCallOnWillUnmount.push(untapFromRender)

      const sideEffectsDictP = this._finalFace.pointer().prop('sideEffects')
      this._sideEffetsHandler = new SideEffectsHandler(this.studio.dataverseContext, this._finalFace, sideEffectsDictP)

    }

    _createAtom() {
      return D.atoms.dict({
        instanceId: this.studio._getNewComponentInstanceId(),
        props: this.props.props,
        modifierInstantiationDescriptors: this.props.modifierInstantiationDescriptors,
        studio: this.studio,
        // key: this.props.key,
        state: getInitialState ? getInitialState(): D.atoms.dict({}),
      })
    }

    _makePrototypalDictD() {
      const basePrototypalDict =
        D.derivations.prototypalDict({_atom: () => this._atom}).extend(TheaterJSComponent._baseLookupTable)

      const prototypalDictWithoutModifiers = modifyPrototypalDict(basePrototypalDict)

      // return D.derivations.constant(prototypalDictWithoutModifiers)

      const modifierInstantiationDescriptorsByIdP = this._atom.pointer().prop('modifierInstantiationDescriptors').prop('byId')
      const finalPrototypalDictD =
        this._atom.pointer().prop('modifierInstantiationDescriptors').prop('list').flatMap((list: D.IDerivedArray<$FixMe>) => {
          if (!list)
            return prototypalDictWithoutModifiers

          // if (list.length() > 0) debugger

          // return prototypalDictWithoutModifiers

          return list.map((idD) => idD.flatMap((id: string) => modifierInstantiationDescriptorsByIdP.prop(id)))
            .reduce(
              (dict, modifierInstantiationDescriptor) => {
                return this._applyModifier(modifierInstantiationDescriptor, dict)
              },
              D.derivations.constant(prototypalDictWithoutModifiers),
            )
        })

      return finalPrototypalDictD
    }

    _applyModifier(modifierInstantiationDescriptor, dict): D.IDerivation<$FixMe> {
      return modifierInstantiationDescriptor.prop('disabled').flatMap((disabled: boolean) => {
        if (disabled) return dict

        return modifierInstantiationDescriptor.prop('modifierId').flatMap((modifierId: string) => {
          return this.studio.atom.pointer().prop('coreModifierDescriptorsById').prop(modifierId).prop('modifyPrototypalDict').flatMap((possibleFn: ?Function) => {
            if (!possibleFn) console.warn('this shouldnt happen')
            return possibleFn ? possibleFn(modifierInstantiationDescriptor.pointer().prop('props'), dict) : dict
          })
        })
      })

    }

    componentWillReceiveProps(newProps: Props) {
      if (newProps.props !== this.props.props) {
        this._atom.setProp('props', newProps.props)
      }

      if (newProps.modifierInstantiationDescriptors !== this.props.modifierInstantiationDescriptors) {
        this._atom.setProp('modifierInstantiationDescriptors', newProps.modifierInstantiationDescriptors)
      }
    }

    componentWillMount() {
      this._whatToRender = this._finalFace.prop('render').getValue()
      // this._finalFace.prop('componentWillMountCallbacks').getValue().face().forEach((fn) => fn(this._finalFace))
    }

    componentDidMount() {
      this._sideEffetsHandler.startAppying()
    }

    componentWillUnmount() {
      this._sideEffetsHandler.stopApplying()
      this._fnsToCallOnWillUnmount.forEach((fn) => {fn()})
    }

    render() {
      return this._whatToRender
    }
  }


  return TheaterJSComponent
}