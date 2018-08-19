import jsonPatchLib from 'fast-json-patch'
import atomifyDeep from '$shared/DataVerse/atoms/atomifyDeep'
import { ArrayAtom } from '$shared/DataVerse/atoms/arrayAtom';

type Diff = $FixMe
type Stuff = $FixMe

const ops = {
  dict: {
    replace: (diff: Diff, stuff: Stuff) => {
      stuff.curAtom.setProp(
        jsonPatchLib.unescapePathComponent(stuff.lastComponent),
        atomifyDeep(diff.value),
      )
    },

    remove: (diff: Diff, stuff: Stuff) => {
      stuff.curAtom.deleteProp(
        jsonPatchLib.unescapePathComponent(stuff.lastComponent),
      )
    },

    add: (diff: Diff, stuff: Stuff) => {
      stuff.curAtom.setProp(
        jsonPatchLib.unescapePathComponent(stuff.lastComponent),
        atomifyDeep(diff.value),
      )
    },

    move(diff: Diff, stuff: Stuff) {},
  },
  array: {
    remove(diff: Diff, {curAtom, lastComponent}: Stuff) {
      curAtom.splice(lastComponent, 1, [])
    },
    replace(diff: Diff, p: {curAtom: ArrayAtom<$IntentionalAny>, lastComponent: number}) {
      p.curAtom.setIndex(p.lastComponent, atomifyDeep(diff.value))
    },
    add(diff: Diff, p: {curAtom: ArrayAtom<$IntentionalAny>, lastComponent: number}) {
      p.curAtom.splice(p.lastComponent, 0, [atomifyDeep(diff.value)])
    },
  },
  box: {},
}

export default function applyJsonDiffToAtom(diff: Diff, atom: $FixMe) {
  if (diff.path.length === 0) {
    throw new Error(`@todo Can't handle zero-length diff paths yet`)
  }

  const components = diff.path.split('/')
  components.shift()
  const lastComponent = components.pop()

  let curAtom: $FixMe = atom
  for (let component of components) {
    component = jsonPatchLib.unescapePathComponent(component)
    // if (curAtom.isDictAtom !== true) debugger
    curAtom =
      curAtom.isDictAtom === true
        ? curAtom.prop(component)
        : curAtom.isArrayAtom === true
          ? curAtom.index(parseInt(component, 10))
          : () => {
              throw new Error('Not implemented')
            }
  }

  const type =
    curAtom.isDictAtom === true
      ? 'dict'
      : curAtom.isArrayAtom === true
        ? 'array'
        : curAtom.isBoxAtom === true
          ? 'box'
          : (function() {
              throw new Error(`Unrecognizable atom type '${atom}'`)
            })()

  const stuff = {
    atom,
    components,
    lastComponent:
      type === 'array'
        ? lastComponent === '-' ? curAtom.length() : parseInt(lastComponent, 10)
        : lastComponent,
    curAtom,
  }

  // @ts-ignore @todo
  const opFn = ops[type][diff.op]
  if (opFn) {
    opFn(diff, stuff)
  } else {
    if (diff.op === 'test') return
    debugger
    throw Error(
      `@todo Diff op '${diff.op}' for atom type ${type} not yet supported`,
    )
  }
}
