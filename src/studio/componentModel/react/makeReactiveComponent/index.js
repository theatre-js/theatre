// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'
import {withStudio, type WithStudioProps} from '../studioContext'
import * as D from '$shared/DataVerse'
import SideEffectsHandler from './SideEffectsHandler'

type MakeReactiveComponentArgs = {
  modifyPrototypalDict: (D.IPrototypalDict<$FixMe>) => D.IPrototypalDict<$FixMe>,
  displayName: string,
  getInitialState?: () => D.IDictAtom<$FixMe>,
}

export default function makeReactiveComponent({modifyPrototypalDict, displayName, getInitialState}: MakeReactiveComponentArgs) {
  type Props = {
    key: string,
    props: $FixMe,
    modifierInstantiationDescriptors: $FixMe,
  } & WithStudioProps

  class TheaterJSComponent extends React.PureComponent<Props, void> {
    static displayName = displayName
    _finalFace: $FixMe
    _atom: $FixMe
    _whatToRender: $FixMe
    _fnsToCallOnWillUnmount: Array<() => void>
    _prototypalDictD: D.IDerivation<$FixMe>
    _sideEffetsHandler: SideEffectsHandler

    _atom: D.IDictAtom<{
      instanceId: string | number,
      props: $ElementType<Props, 'props'>,
      studio: $ElementType<WithStudioProps, 'studio'>,
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
      dataVerseContext: (d) => d.pointer().prop('studio').getValue().dataVerseContext,
      key: (d) => d.pointer().prop('_atom').prop('key'),
      modifierInstantiationDescriptors: (d) => d.pointer().prop('_atom').prop('modifierInstantiationDescriptors'),
      state: (d) => d.pointer().prop('_atom').prop('state'),
    }

    constructor(props: Props) {
      super(props)
      this._fnsToCallOnWillUnmount = []

      this._atom = this._createAtom()
      this._prototypalDictD = this._makePrototypalDictD()

      this._finalFace =
        new D.derivations.PrototypalDictFace(this._prototypalDictD.getValue(), props.studio.dataverseContext)

      const untapFromPrototypalMapChanges = this._prototypalDictD.setDataVerseContext(props.studio.dataverseContext).changes().tap((newFinalPrototypalDict) => {
        this._finalFace.setHead(newFinalPrototypalDict)
      })

      this._fnsToCallOnWillUnmount.push(untapFromPrototypalMapChanges)

      this._whatToRender = null
      const untapFromRender = this._finalFace.prop('render').setDataVerseContext(props.studio.dataverseContext).changes().tap((whatToRender) => {
        this._whatToRender = whatToRender
        this.forceUpdate()
      })
      this._fnsToCallOnWillUnmount.push(untapFromRender)

      const sideEffectsDictP = this._finalFace.pointer().prop('sideEffects')
      this._sideEffetsHandler = new SideEffectsHandler(props.studio.dataverseContext, this._finalFace, sideEffectsDictP)

    }

    _createAtom() {
      return D.atoms.dict({
        instanceId: this.props.studio._getNewComponentInstanceId(),
        props: this.props.props,
        modifierInstantiationDescriptors: this.props.modifierInstantiationDescriptors,
        studio: this.props.studio,
        key: this.props.key,
        state: getInitialState ? getInitialState(): D.atoms.dict({}),
      })
    }

    _makePrototypalDictD() {
      const basePrototypalDict =
        D.derivations.prototypalDict({_atom: () => this._atom}).extend(TheaterJSComponent._baseLookupTable)

      const prototypalDictWithoutModifiers = modifyPrototypalDict(basePrototypalDict)

      const modifierInstantiationDescriptorsByIdP = this._atom.pointer().prop('modifierInstantiationDescriptors').prop('byId')
      // console.log('----', modifierInstantiationDescriptorsByIdP.getValue())
      return D.derivations.constant(prototypalDictWithoutModifiers)

      const finalPrototypalDictD =
        this._atom.pointer().prop('modifierInstantiationDescriptors').prop('list').flatMap((list: D.IDerivedArray<$FixMe>) => {
          return list.map((id: string) => modifierInstantiationDescriptorsByIdP.prop(id))
          .reduce(
            (dictD, modifierInstantiationDescriptorP) => {
              return dictD.flatMap((dict) => this._applyModifier(modifierInstantiationDescriptorP, dict))
            },
            D.derivations.constant(prototypalDictWithoutModifiers),
          )
        })

      return finalPrototypalDictD
    }

    _applyModifier(modifierInstantiationDescriptorP, dict): D.IDerivation<$FixMe> {
      return modifierInstantiationDescriptorP.prop('disabled').flatMap((disabled: boolean) => {
        if (disabled) return dict

        return modifierInstantiationDescriptorP.prop('modifierId').flatMap((modifierId: string) => {
          return this.props.studio.atom.pointer().prop('coreModifierDescriptorsById').prop(modifierId).prop('modifyPrototypalDict').flatMap((possibleFn: ?Function) => {
            if (!possibleFn) console.warn('this shouldnt happen')
            return possibleFn ? possibleFn(modifierInstantiationDescriptorP.prop('props'), dict) : dict
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

  return compose(
    withStudio,
  )(TheaterJSComponent)
}