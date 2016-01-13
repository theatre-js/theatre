Events = require './eventsController/Events'
EventType = require './eventsController/EventType'
_TimelineRow = require './_TimelineRow'
_queuedItems = []

module.exports = class EventsController extends _TimelineRow
  constructor: ->
    @_serializedAddress = ['timeline', '_eventsControllers', @id]
    super

    @_types = {}
    @events = new Events @
    @_chronology = @events.chronology
    @_lastRanIndex = -1

  _tickForward: (t) ->

  _tickBackward: (t) ->

  defineType: (id, options) ->
    if @_types[id]?
      throw Error "An event-type named '#{id}' already exists"

    @_types[id] = new EventType @, id, options
    this

  getType: (id) ->
    @_types[id]

  _tickForward: (t) ->
    return if @_chronology.length is 0
    nextIndex = @_lastRanIndex + 1
    while (nextItem = @_chronology[nextIndex]) and nextItem?
      break if nextItem.t > t
      _queuedItems.push nextItem
      nextIndex++

    for item, i in _queuedItems
      item.tickAt t, i is _queuedItems.length - 1

    if _queuedItems.length > 0
      _queuedItems.length = 0
      @_lastRanIndex = nextIndex - 1

    return

  _tickBackward: (t) ->
    nextIndex = @_lastRanIndex
    loop
      item = @_chronology[nextIndex]
      break if not item? or item.t < t
      _queuedItems.push item
      nextIndex--

    for item, i in _queuedItems
      item.tickAt t, i is _queuedItems.length - 1

    if _queuedItems.length > 0
      _queuedItems.length = 0
      @_lastRanIndex = nextIndex

    return