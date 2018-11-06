import React from 'react'

const simplyMergeCallbacks: Merger = (oldCallback, newCallback) => {
  if (!oldCallback) return newCallback
  return (...args: $IntentionalAny[]) => {
    oldCallback!(...args)
    newCallback(...args)
  }
}

function initializeMergers() {
  const mergables = [
    'onClick',
    'onContextMenu',
    'onDoubleClick',
    'onDrag',
    'onDragEnd',
    'onDragEnter',
    'onDragExit',
    'onDragLeave',
    'onDragOver',
    'onDragStart',
    'onDrop',
    'onMouseDown',
    'onMouseEnter',
    'onMouseLeave',
    'onMouseMove',
    'onMouseOut',
    'onMouseOver',
    'onMouseUp',
  ]
  mergables.forEach(propKey => {
    mergerByPropKey[propKey] = simplyMergeCallbacks
  })
}

let mergersInitialised = false

type Callback = (...args: $IntentionalAny[]) => void

type Merger = (originalCb: undefined | Callback, newCb: Callback) => Callback

const mergerByPropKey: {[propKey: string]: Merger} = {
  ref(_, newRef: $IntentionalAny) {
    return newRef
  },
}

function getMerger(propKey: string) {
  if (!mergersInitialised) {
    mergersInitialised = true
    initializeMergers()
  }
  return mergerByPropKey[propKey]
}

type MergableProps = Pick<
  React.AllHTMLAttributes<$IntentionalAny>,
  | 'onClick'
  | 'onContextMenu'
  | 'onDoubleClick'
  | 'onDrag'
  | 'onDragEnd'
  | 'onDragEnter'
  | 'onDragExit'
  | 'onDragLeave'
  | 'onDragOver'
  | 'onDragStart'
  | 'onDrop'
  | 'onMouseDown'
  | 'onMouseEnter'
  | 'onMouseLeave'
  | 'onMouseMove'
  | 'onMouseOut'
  | 'onMouseOver'
  | 'onMouseUp'
> & {
  ref: React.Ref<$IntentionalAny>
}

const cloneElementAndMergeCallbacks = (
  node: React.ReactElement<$IntentionalAny>,
  additionalProps: Partial<MergableProps>,
) => {
  // debugger
  const newProps: Partial<MergableProps> = {}
  const keys = Object.keys(additionalProps)

  for (let key of keys) {
    const merger = getMerger(key)
    if (!merger) {
      throw new Error(`Cannot merge react prop '${key}'`)
    }
    ;(newProps as $IntentionalAny)[key] = merger(
      node.props[key],
      (additionalProps as $IntentionalAny)[key],
    )
  }

  return React.cloneElement(node, newProps)
}

export default cloneElementAndMergeCallbacks
