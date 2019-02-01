import TimelineTemplate from '$tl/timelines/TimelineTemplate'
import {val} from '$shared/DataVerse/atom'
import ObjectTemplate from '$tl/objects/ObjectTemplate'
import uiSelectors from '$tl/ui/store/selectors'
import UI from '$tl/ui/UI'
import {PropAddress, ObjectAddress} from '$tl/handy/addresses'
import Project from '$tl/Project/Project'
import projectSelectors from '$tl/Project/store/selectors'
import {Pointer} from '$shared/DataVerse/pointer'
import {PropValueContainer} from '$tl/Project/store/types'
import { PropDescriptor } from '$tl/objects/objectTypes';

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
  expandable: boolean
}

type ExcludeHeight<O> = Pick<O, Exclude<keyof O, 'height'>>
export type AnyItem = GroupingItem | ObjectItem | PrimitivePropItem
export const singleItemHeight = 30

export const timelineTemplateToSeriesOfVerticalItems = (
  ui: UI,
  timelineTemplate: TimelineTemplate,
  project: Project,
): AnyItem[] => {
  const items: AnyItem[] = []
  let heightSoFar = 0

  const collapsedNodes = val(
    uiSelectors.historic.getCollapsedNodesOfTimelineByPath(
      ui.atomP.historic,
      timelineTemplate._address,
    ),
  )

  const setOfCollapsedNodes = new Set(Object.keys(collapsedNodes || {}))

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

  const objectTemplates = val(timelineTemplate._objectTemplates.pointer)

  const allPaths = Object.keys(objectTemplates)
  const {rootNode, nodeDescriptorsByPath} = turnPathsIntoHierarchy(allPaths)

  const processNode = (node: NodeDescriptor, depth: number) => {
    const {isObject} = node
    // ui.atomP.historic.allInOnePanel.projects[]
    const expanded = setOfCollapsedNodes.has(node.path) ? false : true
    const hasChildren = node.children.length > 0

    const objectTemplate = val(
      timelineTemplate._objectTemplates.pointer[node.path],
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
        address: isObject ? objectTemplate._address : undefined,
      },
      singleItemHeight,
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

    const objectTemplate = val(timelineTemplate._objectTemplates.pointer[path])

    const propTypes = val(objectTemplate.atom.pointer.objectProps)

    const propKeys = Object.keys(propTypes).sort(alphabeticalCompare)

    propKeys.forEach(propKey => {
      const propType = propTypes[propKey]
      processProp(objectTemplate, path, propKey, propType, propDepth)
    })
  }

  const processProp = (
    objectTemplate: ObjectTemplate,
    objectPath: string,
    propKey: string,
    propDescriptor: PropDescriptor,
    depth: number,
  ) => {

    if (propDescriptor.type === 'number') {
      const propAddr = {...objectTemplate._address, objectPath, propKey}
      // debugger
      const propState = val(
        uiSelectors.historic.getPropState(ui.atomP.historic, propAddr),
      )

      const propStateInProjectP = projectSelectors.historic.getPropState(
        project.atomP.historic,
        propAddr,
      )

      const valueContainerP = propStateInProjectP.valueContainer as Pointer<
        PropValueContainer
      >

      const valueContainerType =
        val(valueContainerP.type) || 'StaticValueContainer'

      const expandable = valueContainerType === 'BezierCurvesOfScalarValues'

      const expanded =
        (expandable && propState && propState.expanded) || false

      push(
        {
          type: 'PrimitiveProp',
          expandable,
          depth,
          address: propAddr,
          key: objectPath + '.' + propKey,
          top: heightSoFar,
          expanded,
        },
        expanded ? propState.heightWhenExpanded : singleItemHeight,
      )
    } else {
      console.error(`@todo not supporting prop type ${propDescriptor.type} yet`)
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
