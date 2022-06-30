import type {} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {
  PropTypeConfig,
  PropTypeConfig_AllSimples,
  PropTypeConfig_Compound,
} from '@theatre/core/propTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {IPropPathToTrackIdTree} from '@theatre/core/sheetObjects/SheetObjectTemplate'
import type Sheet from '@theatre/core/sheets/Sheet'
import type {PathToProp} from '@theatre/shared/utils/addresses'
import type {
  SequenceTrackId,
  StudioSheetItemKey,
} from '@theatre/shared/utils/ids'
import {createStudioSheetItemKey} from '@theatre/shared/utils/ids'
import type {$FixMe, $IntentionalAny} from '@theatre/shared/utils/types'
import {prism, val, valueDerivation} from '@theatre/dataverse'
import logger from '@theatre/shared/logger'
import {titleBarHeight} from '@theatre/studio/panels/BasePanel/common'
import type {Studio} from '@theatre/studio/Studio'
import type {UnknownValidCompoundProps} from '@theatre/core/propTypes/internals'

/**
 * Base "view model" for each row with common
 * required information such as row heights & depth.
 */
export type SequenceEditorTree_Row<TypeName extends string> = {
  /** type of this row, e.g. `"sheet"` or `"sheetObject"` */
  type: TypeName
  /** Height of just the row in pixels */
  nodeHeight: number
  /** Height of the row + height with children in pixels */
  heightIncludingChildren: number

  /** Visual indentation */
  depth: number
  /** A convenient studio sheet localized identifier for managing presence and ephemeral visual effects. */
  sheetItemKey: StudioSheetItemKey
  /**
   * This is a part of the tree, but it is not rendered at all,
   * and it doesn't contribute to height.
   *
   * In the future, if we have a filtering mechanism like "show only position props",
   * this would not be the place to make false, that node should just not be included
   * in the tree at all, so it doesn't affect aggregate keyframes.
   */
  shouldRender: boolean
  /**
   * Distance in pixels from the top of this row to the row container's top
   * This can be used to help figure out what's being box selected (marquee).
   */
  top: number
  /** Row number (e.g. for correctly styling even / odd alternating styles) */
  n: number
}

export type SequenceEditorTree = SequenceEditorTree_Sheet

export type SequenceEditorTree_Sheet = SequenceEditorTree_Row<'sheet'> & {
  sheet: Sheet
  children: SequenceEditorTree_SheetObject[]
}

export type SequenceEditorTree_SheetObject =
  SequenceEditorTree_Row<'sheetObject'> & {
    isCollapsed: boolean
    sheetObject: SheetObject
    children: Array<
      SequenceEditorTree_PropWithChildren | SequenceEditorTree_PrimitiveProp
    >
  }

export type SequenceEditorTree_PropWithChildren =
  SequenceEditorTree_Row<'propWithChildren'> & {
    isCollapsed: boolean
    sheetObject: SheetObject
    propConf: PropTypeConfig_Compound<UnknownValidCompoundProps>
    pathToProp: PathToProp
    children: Array<
      SequenceEditorTree_PropWithChildren | SequenceEditorTree_PrimitiveProp
    >
    trackMapping: IPropPathToTrackIdTree
  }

export type SequenceEditorTree_PrimitiveProp =
  SequenceEditorTree_Row<'primitiveProp'> & {
    sheetObject: SheetObject
    pathToProp: PathToProp
    trackId: SequenceTrackId
    propConf: PropTypeConfig_AllSimples
  }

export type SequenceEditorTree_AllRowTypes =
  | SequenceEditorTree_Sheet
  | SequenceEditorTree_SheetObject
  | SequenceEditorTree_PropWithChildren
  | SequenceEditorTree_PrimitiveProp

const HEIGHT_OF_ANY_TITLE = 28

/**
 * Must run inside prism()
 */
export const calculateSequenceEditorTree = (
  sheet: Sheet,
  studio: Studio,
): SequenceEditorTree => {
  prism.ensurePrism()
  let topSoFar = titleBarHeight
  let nSoFar = 0
  const rootShouldRender = true

  const tree: SequenceEditorTree = {
    type: 'sheet',
    sheet,
    children: [],
    sheetItemKey: createStudioSheetItemKey.forSheet(),
    shouldRender: rootShouldRender,
    top: topSoFar,
    depth: -1,
    n: nSoFar,
    nodeHeight: 0, // always 0
    heightIncludingChildren: -1, // will define this later
  }

  if (rootShouldRender) {
    nSoFar += 1
  }

  const collapsableItemSetP =
    studio.atomP.ahistoric.projects.stateByProjectId[sheet.address.projectId]
      .stateBySheetId[sheet.address.sheetId].sequence.collapsableItems

  for (const sheetObject of Object.values(val(sheet.objectsP))) {
    if (sheetObject) {
      addObject(sheetObject, tree.children, tree.depth + 1, rootShouldRender)
    }
  }
  tree.heightIncludingChildren = topSoFar - tree.top

  function addObject(
    sheetObject: SheetObject,
    arrayOfChildren: Array<SequenceEditorTree_SheetObject>,
    level: number,
    shouldRender: boolean,
  ) {
    const trackSetups = val(
      sheetObject.template.getMapOfValidSequenceTracks_forStudio(),
    )

    if (Object.keys(trackSetups).length === 0) return

    const isCollapsedP =
      collapsableItemSetP.byId[
        createStudioSheetItemKey.forSheetObject(sheetObject)
      ].isCollapsed
    const isCollapsed = valueDerivation(isCollapsedP).getValue() ?? false

    const row: SequenceEditorTree_SheetObject = {
      type: 'sheetObject',
      isCollapsed,
      sheetItemKey: createStudioSheetItemKey.forSheetObject(sheetObject),
      shouldRender,
      top: topSoFar,
      children: [],
      depth: level,
      n: nSoFar,
      sheetObject: sheetObject,
      nodeHeight: shouldRender ? HEIGHT_OF_ANY_TITLE : 0,
      // Question: Why -1? Is this relevant for "shouldRender"?
      // Perhaps this is to indicate this does not have a valid value.
      heightIncludingChildren: -1,
    }
    arrayOfChildren.push(row)

    if (shouldRender) {
      nSoFar += 1
      // As we add rows to the tree, top to bottom, we accumulate the pixel
      // distance to the top of the tree from the bottom of the current row:
      topSoFar += row.nodeHeight
    }

    addProps(
      sheetObject,
      trackSetups,
      [],
      sheetObject.template.config,
      row.children,
      level + 1,
      shouldRender && !isCollapsed,
    )

    row.heightIncludingChildren = topSoFar - row.top
  }

  function addProps(
    sheetObject: SheetObject,
    trackSetups: IPropPathToTrackIdTree,
    pathSoFar: PathToProp,
    parentPropConfig: PropTypeConfig_Compound<$IntentionalAny>,
    arrayOfChildren: Array<
      SequenceEditorTree_PrimitiveProp | SequenceEditorTree_PropWithChildren
    >,
    level: number,
    shouldRender: boolean,
  ) {
    for (const [propKey, setupOrSetups] of Object.entries(trackSetups)) {
      const propConfig = parentPropConfig.props[propKey]
      addProp(
        sheetObject,
        setupOrSetups!,
        [...pathSoFar, propKey],
        propConfig,
        arrayOfChildren,
        level,
        shouldRender,
      )
    }
  }

  function addProp(
    sheetObject: SheetObject,
    trackIdOrMapping: SequenceTrackId | IPropPathToTrackIdTree,
    pathToProp: PathToProp,
    conf: PropTypeConfig,
    arrayOfChildren: Array<
      SequenceEditorTree_PrimitiveProp | SequenceEditorTree_PropWithChildren
    >,
    level: number,
    shouldRender: boolean,
  ) {
    if (conf.type === 'compound') {
      const trackMapping =
        trackIdOrMapping as $IntentionalAny as IPropPathToTrackIdTree
      addProp_compound(
        sheetObject,
        trackMapping,
        conf,
        pathToProp,
        conf,
        arrayOfChildren,
        level,
        shouldRender,
      )
    } else if (conf.type === 'enum') {
      logger.warn('Prop type enum is not yet supported in the sequence editor')
    } else {
      const trackId = trackIdOrMapping as $IntentionalAny as SequenceTrackId

      addProp_primitive(
        sheetObject,
        trackId,
        pathToProp,
        conf,
        arrayOfChildren,
        level,
        shouldRender,
      )
    }
  }

  function addProp_compound(
    sheetObject: SheetObject,
    trackMapping: IPropPathToTrackIdTree,
    propConf: PropTypeConfig_Compound<UnknownValidCompoundProps>,
    pathToProp: PathToProp,
    conf: PropTypeConfig_Compound<$FixMe>,
    arrayOfChildren: Array<
      SequenceEditorTree_PrimitiveProp | SequenceEditorTree_PropWithChildren
    >,
    level: number,
    shouldRender: boolean,
  ) {
    const isCollapsedP =
      collapsableItemSetP.byId[
        createStudioSheetItemKey.forSheetObjectProp(sheetObject, pathToProp)
      ].isCollapsed
    const isCollapsed = valueDerivation(isCollapsedP).getValue() ?? false

    const row: SequenceEditorTree_PropWithChildren = {
      type: 'propWithChildren',
      isCollapsed,
      propConf,
      pathToProp,
      sheetItemKey: createStudioSheetItemKey.forSheetObjectProp(
        sheetObject,
        pathToProp,
      ),
      sheetObject: sheetObject,
      shouldRender,
      top: topSoFar,
      children: [],
      nodeHeight: shouldRender ? HEIGHT_OF_ANY_TITLE : 0,
      heightIncludingChildren: -1,
      depth: level,
      trackMapping,
      n: nSoFar,
    }
    arrayOfChildren.push(row)

    if (shouldRender) {
      topSoFar += row.nodeHeight
      nSoFar += 1
    }

    addProps(
      sheetObject,
      trackMapping,
      pathToProp,
      conf,
      row.children,
      level + 1,
      // collapsed shouldn't render child props
      shouldRender && !isCollapsed,
    )
    // }
    row.heightIncludingChildren = topSoFar - row.top
  }

  function addProp_primitive(
    sheetObject: SheetObject,
    trackId: SequenceTrackId,
    pathToProp: PathToProp,
    propConf: PropTypeConfig_AllSimples,
    arrayOfChildren: Array<
      SequenceEditorTree_PrimitiveProp | SequenceEditorTree_PropWithChildren
    >,
    level: number,
    shouldRender: boolean,
  ) {
    const row: SequenceEditorTree_PrimitiveProp = {
      type: 'primitiveProp',
      propConf: propConf,
      depth: level,
      sheetItemKey: createStudioSheetItemKey.forSheetObjectProp(
        sheetObject,
        pathToProp,
      ),
      sheetObject: sheetObject,
      pathToProp,
      shouldRender,
      top: topSoFar,
      nodeHeight: shouldRender ? HEIGHT_OF_ANY_TITLE : 0,
      heightIncludingChildren: shouldRender ? HEIGHT_OF_ANY_TITLE : 0,
      trackId,
      n: nSoFar,
    }
    arrayOfChildren.push(row)
    nSoFar += 1
    topSoFar += row.nodeHeight
  }

  return tree
}
