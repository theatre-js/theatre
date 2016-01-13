_Emitter = require '../_Emitter'
array = require 'utila/lib/array'

module.exports = class _ChronologyContainer extends _Emitter
  constructor: (@parent) ->
    super
    @chronology = []
    @chronologyLength = 0
    @_changeRange = [Infinity, -Infinity]
    @_idCounter = -1

  _getIndexOfItemBeforeOrAt: (t) ->
    lastIndex = -1
    for item, index in @chronology
      break if item.t > t
      lastIndex = index

    lastIndex

  _setUpdateRange: (from, to) ->
    @_changeRange[0] = Math.min(@_changeRange[0], from)
    @_changeRange[1] = Math.max(@_changeRange[1], to)
    return

  _reportChange: ->
    if @_changeRange[0] is Infinity and @_changeRange[1] is -Infinity
      @parent._reportIneffectiveChange()
      return

    @parent._reportChange @_changeRange[0], @_changeRange[1]

    @_changeRange[0] = Infinity
    @_changeRange[1] = -Infinity

    return

  _getItemByIndex: (index) ->
    @chronology[index]

  _getItemIndex: (item) ->
    @chronology.indexOf item

  _getItemAt: (t) ->
    index = @_getIndexOfItemBeforeOrAt t
    item = @_getItemByIndex index

    return unless item?
    return unless item.t is t

    item

  _itemExistsAt: (t) ->
    @_getItemAt(t)?

  _injectItemOn: (item, index) ->
    array.injectInIndex @chronology, index, item
    return

  _pluckItemOn: (index) ->
    array.pluck @chronology, index
    return

  _recalculateLength: ->
    lastItem = @chronology[@chronology.length - 1]

    if lastItem?
      @timeline._maximizeDuration lastItem.t
      if lastItem.t isnt @chronologyLength
        @chronologyLength = lastItem.t
        @_emit 'duration-change'

    return

  getItemsInRange: (from, to) ->
    items = []

    for item in @chronology
      break if item.t > to
      continue if item.t < from
      items.push item

    items

  done: ->
    do @_recalculateLength
    do @_reportChange
    return