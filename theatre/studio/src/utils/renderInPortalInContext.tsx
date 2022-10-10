import {Atom} from '@theatre/dataverse'
import {useVal} from '@theatre/react'
import type {$FixMe, $IntentionalAny} from '@theatre/shared/utils/types'
import React from 'react'
import {createPortal} from 'react-dom'

type ElToRenderInContext = {
  comp: React.ComponentType<$IntentionalAny>
  props: {}
  portalNode: HTMLElement | SVGElement
}

const theAtom = new Atom<{
  set: Record<number, true>
  byId: Record<number, ElToRenderInContext>
}>({
  set: {},
  byId: {},
})

let lastId = 1

export const getMounter = () => {
  const id = lastId++
  function mountOrRender<Props>(
    comp: React.ComponentType<Props>,
    props: Props,
    portalNode: HTMLElement,
  ) {
    theAtom.reduceState([], (s) => {
      return {
        byId: {...s.byId, [id]: {comp, props, portalNode}},
        set: {...s.set, [id]: true},
      }
    })
  }

  function unmount() {
    theAtom.reduceState([], (s) => {
      const set = {...s.set}
      const byId = {...s.byId}
      delete set[id]
      return {byId, set}
    })
  }

  return {mountOrRender, unmount}
}

export const MountAll = () => {
  const ids = Object.keys(useVal(theAtom.pointer.set))
  return (
    <>
      {ids.map((id) => (
        <Mount key={'id-' + id} id={id} />
      ))}
    </>
  )
}

const Mount = ({id}: {id: number}) => {
  const {comp, portalNode, props} = useVal(theAtom.pointer.byId[id])
  const Comp = comp as $FixMe

  return createPortal(<Comp {...props} />, portalNode)
}
