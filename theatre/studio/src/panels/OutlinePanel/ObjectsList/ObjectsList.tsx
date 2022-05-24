import type Sheet from '@theatre/core/sheets/Sheet'
import {usePrism} from '@theatre/react'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import {ObjectItem} from './ObjectItem'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import BaseItem from '@theatre/studio/panels/OutlinePanel/BaseItem'
import type {NamespacedObjects} from './NamespacedObjects'
import {addToNamespace} from './NamespacedObjects'

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

    return <NamespaceTree namespace={rootObject} visualIndentation={depth} />
  }, [sheet, depth])
}

function NamespaceTree(props: {
  namespace: NamespacedObjects
  visualIndentation: number
}) {
  return (
    <>
      {[...props.namespace.entries()].map(([label, {object, nested}]) => {
        const children = (
          <React.Fragment key={`${label} - ${props.visualIndentation}`}>
            {object && (
              <ObjectItem
                depth={props.visualIndentation}
                // key is useful for navigating react dev component tree
                key={'objectPath(' + object.address.objectKey + ')'}
                // object entries should not allow this to be undefined
                sheetObject={object}
                overrideLabel={label}
              />
            )}
            {nested && (
              <NamespaceTree
                namespace={nested}
                // Question: will there be key conflict if two components have the same labels?
                key={'namespaceTree(' + label + ')'}
                visualIndentation={props.visualIndentation + 1}
              />
            )}
          </React.Fragment>
        )

        return nested ? (
          <BaseItem
            selectionStatus="not-selectable"
            label={label}
            // key necessary for no duplicate keys (next to other React.Fragments)
            key={`baseItem(${label})`}
            depth={props.visualIndentation}
            children={children}
          />
        ) : (
          // if we don't have any nested items, just render the children with no wrapper, here.
          children
        )
      })}
    </>
  )
}

export default ObjectsList
