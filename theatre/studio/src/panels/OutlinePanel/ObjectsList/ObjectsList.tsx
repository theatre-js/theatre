import type Sheet from '@theatre/core/sheets/Sheet'
import {usePrism} from '@theatre/react'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import {ObjectItem} from './ObjectItem'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import BaseItem from '@theatre/studio/panels/OutlinePanel/BaseItem'
import {useCollapseStateInOutlinePanel} from '@theatre/studio/panels/OutlinePanel/outlinePanelUtils'

export const Li = styled.li<{isSelected: boolean}>`
  color: ${(props) => (props.isSelected ? 'white' : 'hsl(1, 1%, 80%)')};
`

const ObjectsList: React.FC<{
  depth: number
  sheet: Sheet
}> = ({sheet, depth}) => {
  return usePrism(() => {
    const objectsMap = val(sheet.objectsP)
    const objects = Object.values(objectsMap).filter(
      (a): a is SheetObject => a != null,
    )

    const rootObject: NamespacedObjects = new Map()
    objects.forEach((object) => {
      addToNamespace(rootObject, object)
    })

    return (
      <NamespaceTree
        namespace={rootObject}
        visualIndentation={depth}
        path={[]}
        sheet={sheet}
      />
    )
  }, [sheet, depth])
}

function NamespaceTree(props: {
  namespace: NamespacedObjects
  visualIndentation: number
  path: string[]
  sheet: Sheet
}) {
  return (
    <>
      {[...props.namespace.entries()].map(([label, {object, nested}]) => {
        return (
          <Namespace
            key={label}
            label={label}
            object={object}
            nested={nested}
            visualIndentation={props.visualIndentation}
            path={props.path}
            sheet={props.sheet}
          />
        )
      })}
    </>
  )
}

function Namespace(props: {
  nested?: NamespacedObjects
  label: string
  object?: SheetObject
  visualIndentation: number
  path: string[]
  sheet: Sheet
}) {
  const {nested, label, object, sheet} = props
  const {collapsed, setCollapsed} = useCollapseStateInOutlinePanel({
    type: 'namespace',
    sheet,
    path: props.path,
  })

  const nestedChildrenElt = nested && (
    <NamespaceTree
      namespace={nested}
      path={[...props.path, label]}
      // Question: will there be key conflict if two components have the same labels?
      key={'namespaceTree(' + label + ')'}
      visualIndentation={props.visualIndentation + 1}
      sheet={sheet}
    />
  )
  const sameNameElt = object && (
    <ObjectItem
      depth={props.visualIndentation}
      // key is useful for navigating react dev component tree
      key={'objectPath(' + object.address.objectKey + ')'}
      // object entries should not allow this to be undefined
      sheetObject={object}
      overrideLabel={label}
    />
  )

  return (
    <React.Fragment key={`${label} - ${props.visualIndentation}`}>
      {sameNameElt}
      {nestedChildrenElt && (
        <BaseItem
          selectionStatus="not-selectable"
          label={label}
          // key necessary for no duplicate keys (next to other React.Fragments)
          key={`baseItem(${label})`}
          depth={props.visualIndentation}
          children={nestedChildrenElt}
          collapsed={collapsed}
          setIsCollapsed={setCollapsed}
        />
      )}
    </React.Fragment>
  )
}

export default ObjectsList

/** See {@link addToNamespace} for adding to the namespace, easily. */
type NamespacedObjects = Map<
  string,
  {
    object?: SheetObject
    nested?: NamespacedObjects
    path: string[]
  }
>

function addToNamespace(
  mutObjects: NamespacedObjects,
  object: SheetObject,
  path = getObjectNamespacePath(object),
) {
  const [next, ...rest] = path
  let existing = mutObjects.get(next)
  if (!existing) {
    existing = {
      nested: undefined,
      object: undefined,
      path: [...path],
    }
    mutObjects.set(next, existing)
  }

  if (rest.length === 0) {
    console.assert(
      !existing.object,
      'expect not to have existing object with same name',
      {existing, object},
    )
    existing.object = object
  } else {
    if (!existing.nested) {
      existing.nested = new Map()
    }

    addToNamespace(existing.nested, object, rest)
  }
}

function getObjectNamespacePath(object: SheetObject): string[] {
  let existing = OBJECT_SPLITS_MEMO.get(object)
  if (!existing) {
    existing = object.address.objectKey.split(
      RE_SPLIT_BY_SLASH_WITHOUT_WHITESPACE,
    )
    console.assert(existing.length > 0, 'expected not empty')
    OBJECT_SPLITS_MEMO.set(object, existing)
  }
  return existing
}
/**
 * Relying on the fact we try to "sanitize paths" earlier.
 * Go look for `sanifySlashedPath` in a `utils/slashedPaths.ts`.
 */
const RE_SPLIT_BY_SLASH_WITHOUT_WHITESPACE = /\s*\/\s*/g
const OBJECT_SPLITS_MEMO = new WeakMap<SheetObject, string[]>()
