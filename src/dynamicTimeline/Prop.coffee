Pacs = require './prop/Pacs'
_TimelineRow = require './_TimelineRow'

module.exports = class Prop extends _TimelineRow
  constructor: (@timeline, @id) ->
    @_serializedAddress = ['timeline', '_allProps', @id]
    super
    @pacs = new Pacs @
    @_chronology = @pacs.chronology
    @_nextIndexToCheck = 0

  serialize: ->
    se = pacs: @pacs.serialize()
    se

  _loadFrom: (se) ->
    @pacs.loadFrom se.pacs
    return

  _getInitial: ->
    firstPoint = @_chronology[0]
    if firstPoint? then firstPoint.value else @initial

  getValueAt: (t) ->
    v = @pacs.getValueAt t
    return v if v?
    @_getInitial()

  _tickForward: (t) ->
    item = @_chronology[@_nextIndexToCheck]
    return if not item?
    if item.t > t
      # if it's the first item
      if @_nextIndexToCheck is 0
        # fill in before first point
        @_set @_getInitial()
        @_nextIndexToCheck = 1

      return

    nextIndex = @_nextIndexToCheck + 1

    while (nextItem = @_chronology[nextIndex]) and nextItem?
      break if nextItem.t > t
      item = nextItem
      @_nextIndexToCheck = nextIndex
      nextIndex++

    if item.isPoint()
      @_nextIndexToCheck++

    @_set item.tickAt t

    return

  _tickBackward: (t) ->
    item = @_chronology[@_nextIndexToCheck]
    return @_tickForward(t) if item? and item.t <= t
    indexToCheck = @_nextIndexToCheck

    loop
      indexToCheck--
      item = @_chronology[indexToCheck]

      unless item?
        @_nextIndexToCheck = 0
        @_set @_getInitial()
        return

      if item.t < t
        @_set item.tickAt t
        @_nextIndexToCheck = indexToCheck

        if item.isPoint()
          @_nextIndexToCheck++

        return

    return