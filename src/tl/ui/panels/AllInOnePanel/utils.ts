import InternalTimeline from '$tl/timelines/InternalTimeline'
import {val} from '$shared/DataVerse2/atom'
import InternalObject from '$tl/objects/InternalObject'
import uiSelectors from '$tl/ui/store/selectors'
import UI from '$tl/ui/UI'
import {PropAddress, ObjectAddress} from '$tl/handy/addresses'

export type NodeDescriptorsByPath = {
  [path: string]: NodeDescriptor
}

export type NodeDescriptor = {
  isObject: boolean
  path: string
  lastComponent: string
  children: string[]
}

const rootPath = '@@@@ROOT@@@@23907uaso;dlsld;kjfs;d298dlksjdlskaj932'

/**
 * Takes an array like ['a / b / c', 'a / d'], and turns it into a hierarchy like:
 *
 * <code>
 * {
 *   'a': {
 *      path: 'a',
 *      children: ['a / b', 'a / d']
 *   },
 *   'a / b': {
 *     path: 'a / b',
 *     chlidren: ['a / b / c']
 *   },
 *   ...
 * }
 * </code>
 *
 */
const turnPathsIntoHierarchy = (allPaths: string[]) => {
  const rootNode: NodeDescriptor = {
    isObject: false,
    path: '',
    children: [],
    lastComponent: rootPath,
  }

  const nodeDescriptorsByPath: NodeDescriptorsByPath = {
    [rootPath]: rootNode,
  }

  for (const path of allPaths) {
    const pathComponents = path.split(/\s*\/\s*/)
    let parent = rootNode
    for (let i = 0; i < pathComponents.length; i++) {
      const pathSoFar = pathComponents.slice(0, i + 1).join(' / ')
      if (!nodeDescriptorsByPath[pathSoFar]) {
        nodeDescriptorsByPath[pathSoFar] = {
          isObject: false,
          path: pathSoFar,
          children: [],
          lastComponent: pathComponents[i],
        }
      }
      const node = nodeDescriptorsByPath[pathSoFar]
      const isLast = i === pathComponents.length - 1
      if (isLast) {
        node.isObject = true
      }
      if (parent.children.indexOf(pathSoFar) === -1)
        parent.children.push(pathSoFar)
      parent = node
    }
  }

  return {rootNode, nodeDescriptorsByPath}
}

interface Item {
  depth: number
  height: number
  top: number
  key: string
}

export interface GroupingItem extends Item {
  type: 'Grouping'
  path: string
  expanded: boolean
  hasChildren: boolean
}

export interface ObjectItem extends Item {
  type: 'ObjectItem'
  path: string
  address: ObjectAddress
  expanded: boolean
  hasChildren: boolean
}

export interface PrimitivePropItem extends Item {
  type: 'PrimitiveProp'
  address: PropAddress
  expanded: boolean
}

type ExcludeHeight<O> = Pick<O, Exclude<keyof O, 'height'>>
type AnyItem = GroupingItem | ObjectItem | PrimitivePropItem
const singleItemheight = 30

export const internalTimelineToSeriesOfVerticalItems = (
  ui: UI,
  internalTimeline: InternalTimeline,
): AnyItem[] => {
  const items: AnyItem[] = []
  let heightSoFar = 0

  const collapsedNodes = val(uiSelectors.getCollapsedNodesOfTimelineByPath(
    ui.atomP.historic,
    internalTimeline._address,
  ))
  const setOfCollapsedNodes = new Set(Object.keys(collapsedNodes))

  const push = (
    _item:
      | ExcludeHeight<GroupingItem>
      | ExcludeHeight<ObjectItem>
      | ExcludeHeight<PrimitivePropItem>,
    height: number,
  ) => {
    const item = ({..._item, height} as $IntentionalAny) as AnyItem
    items.push(item)
    heightSoFar += height
  }

  const internalObjects = val(internalTimeline._internalObjects.pointer)

  const allPaths = Object.keys(internalObjects)
  const {rootNode, nodeDescriptorsByPath} = turnPathsIntoHierarchy(allPaths)

  const processNode = (node: NodeDescriptor, depth: number) => {
    const {isObject} = node
    // ui.atomP.historic.allInOnePanel.projects[]
    const expanded = setOfCollapsedNodes.has(node.path) ? false : true
    const hasChildren = node.children.length > 0

    const internalObject = val(
      internalTimeline._internalObjects.pointer[node.path],
    )

    push(
      {
        type: isObject ? 'ObjectItem' : ('Grouping' as $IntentionalAny),
        path: node.path,
        expanded,
        depth: depth,
        top: heightSoFar,
        key: `Item:${node.path}`,
        hasChildren: node.children.length > 0,
        address: isObject ? internalObject._address : undefined,
      },
      singleItemheight,
    )

    if (expanded && isObject) {
      processProps(node, depth)
    }

    if (expanded && hasChildren) {
      processChildren(node, depth)
    }
  }

  const processChildren = (node: NodeDescriptor, nodeDepth: number) => {
    const childDepth = nodeDepth + 1
    node.children.forEach(childPath => {
      processNode(nodeDescriptorsByPath[childPath], childDepth)
    })
  }

  const processProps = (node: NodeDescriptor, nodeDepth: number) => {
    const propDepth = nodeDepth + 1

    const path = node.path

    const internalObject = val(internalTimeline._internalObjects.pointer[path])

    const nativeObjectType = internalObject.nativeObjectType
    const props = nativeObjectType.props

    const propKeys = Object.keys(props).sort(alphabeticalCompare)

    propKeys.forEach(propKey => {
      processProp(internalObject, path, propKey, propDepth)
    })
  }

  const processProp = (
    internalObject: InternalObject,
    objectPath: string,
    propKey: string,
    depth: number,
  ) => {
    const typeDesc = internalObject.nativeObjectType.props[propKey]

    if (typeDesc.type === 'number') {
      const propAddr = {...internalObject._address, objectPath, propKey}
      // debugger
      const propState = val(
        uiSelectors.getPropState(ui.atomP.historic, propAddr),
      )

      push(
        {
          type: 'PrimitiveProp',
          depth,
          address: propAddr,
          key: objectPath + '.' + propKey,
          top: heightSoFar,
          expanded: (propState && propState.expanded) || false,
        },
        propState && propState.expanded
          ? propState.heightWhenExpanded
          : singleItemheight,
      )
    } else {
      console.error(`@todo not supporting prop type ${typeDesc.type} yet`)
    }
  }

  processChildren(rootNode, 0)

  return items
}

const alphabeticalCompare = function(a: string, b: string) {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
