
// import {TheaterJSComponent, typeSystem} from '$studio/handy'
import * as D from '$shared/DataVerse'
import * as React from 'react'
import {type ComponentDescriptor} from '$studio/componentModel/types'
import forEach from 'lodash/forEach'
import createDidMountHookForAttributes from './createDidMountHookForAttributes'

type Context = {
  front: Object,
  up: Object,
}

const lookupTable = {
  render: (ctx: Context) => {
    return D.derive({
      children: ctx.front.pointer().prop('atom').prop('reactiveProps').prop('children').derivation(),
      refFn: ctx.front.pointer().prop('refFn').derivation(),
    }, (d) => {
      return React.createElement(d.tagName, {ref: d.refFn}, d.children)
    })
  },

  refFn: (ctx: Context) => {
    return D.derive({
      atom: ctx.front.pointer().prop('atom').derivation(),
    }, (d) => {
      return (el) => {
        d.atom.getValue().setProp('elRef', el)
      }
    })
  },

  domAttributes: () => {
    return new D.DerivedMap({})
  },

  componentDidMountCallbacks: (ctx: Context) => {
    return ctx.up.pointer().prop('componendDidMountCallbacks').derivation()
      .map((callbacks: D.DerivedArray<any>) => callbacks.concat([
        () => createDidMountHookForAttributes(ctx),
      ]))
  },

  componentWillUnmountCallbacks: (ctx: Context) => {
    return ctx.up.pointer().prop('componendWillUnmountCallbacks').derivation()
      .map((callbacks: D.DerivedArray<any>) => callbacks.concat([
        () => () => {
          const stopApplyingAtributes = ctx.front.pointer().prop('atom').prop('stopApplyingAtributes').derivation().getValue()
          stopApplyingAtributes()
        },
      ]))
  },
}


class DOMTag extends TheaterJSComponent<{children: React.Node}> {
  static lookupTable = lookupTable

  modifyInitialWire(initialWire: $FixMe) {
    const extendedWithBase = initialWire.extend(DOMTag.lookupTable)
    const extendedWithModifiers = this.applyModifiers(extendedWithBase)
    return extendedWithModifiers
  }
}

const descriptor: ComponentDescriptor = {
  id: 'TheaterJS/Core/DOMTag',
  type: 'HardCoded',
  reactComponent: DOMTag,
  propTypes: typeSystem.ObjectType({
    tagName: typeSystem.union([typeSystem.literal('div'), typeSystem.literal('span')]),
    children: typeSystem.ComponentInstantiationDescriptor,
  }),
}

export default descriptor