import type {StrictRecord} from './types'

/**
 * Consistent way to maintain an unordered structure which plays well with dataverse pointers and
 * data change tracking:
 * - paths to items are stable;
 * - changing one item does not change `allIds`, so it can be mapped over in React without
 *   unnecessary re-renders
 */
export type PointableSet<Id extends string, V> = {
  /**
   * Usually accessed through pointers before accessing the actual value, so we can separate
   * changes to individual items from changes to the entire list of items.
   */
  byId: StrictRecord<Id, V>
  /**
   * Separate list of ids allows us to recognize changes to set item memberships, without being triggered changed when
   * the contents of its items have changed.
   */
  allIds: StrictRecord<Id, true>
}

export const pointableSetUtil = {
  create<Id extends string, V>(
    values?: Iterable<[Id, V]>,
  ): PointableSet<Id, V> {
    const set: PointableSet<Id, V> = {byId: {}, allIds: {}}
    if (values) {
      for (const [id, value] of values) {
        set.byId[id] = value
        set.allIds[id] = true
      }
    }
    return set
  },
  shallowCopy<Id extends string, V>(
    existing: PointableSet<Id, V> | undefined,
  ): PointableSet<Id, V> {
    return {
      byId: {...existing?.byId},
      allIds: {...existing?.allIds},
    }
  },
  add<Id extends string, V>(
    existing: PointableSet<Id, V> | undefined,
    id: Id,
    value: V,
  ): PointableSet<Id, V> {
    return {
      byId: {...existing?.byId, [id]: value},
      allIds: {...existing?.allIds, [id]: true},
    }
  },
  merge<Id extends string, V>(
    sets: PointableSet<Id, V>[],
  ): PointableSet<Id, V> {
    const target = pointableSetUtil.create<Id, V>()
    for (let i = 0; i < sets.length; i++) {
      target.byId = {...target.byId, ...sets[i].byId}
      target.allIds = {...target.allIds, ...sets[i].allIds}
    }
    return target
  },
  remove<Id extends string, V>(
    existing: PointableSet<Id, V>,
    id: Id,
  ): PointableSet<Id, V> {
    const set = pointableSetUtil.shallowCopy(existing)
    delete set.allIds[id]
    delete set.byId[id]
    return set
  },
  /**
   * Note: this is not very performant (it's not crazy slow or anything)
   * it's just that it's not able to re-use object classes in v8 due to
   * excessive `delete obj[key]` instances.
   *
   * `Map`s would be faster, but they aren't used for synchronized JSON state stuff.
   * See {@link StrictRecord} for related conversation.
   */
  filter<Id extends string, V>(
    existing: PointableSet<Id, V>,
    predicate: (value: V | undefined) => boolean | undefined | null,
  ): PointableSet<Id, V> {
    const set = pointableSetUtil.shallowCopy(existing)
    for (const [id, value] of Object.entries(set.byId)) {
      if (!predicate(value)) {
        delete set.allIds[id]
        delete set.byId[id]
      }
    }
    return set
  },
}
