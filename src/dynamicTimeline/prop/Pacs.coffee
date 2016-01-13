array = require 'utila/lib/array'
Point = require './pacs/Point'
Connector = require './pacs/Connector'
PacSelection = require './pacs/PacSelection'
_ChronologyContainer = require '../_ChronologyContainer'

module.exports = class Pacs extends _ChronologyContainer
  constructor: (@prop) ->
    @timeline = @prop.timeline
    super
    @peak = @prop.initial
    @bottom = @prop.initial

    unless Number.isFinite(@bottom) and Number.isFinite(@peak)
      @bottom = 0
      @peak = 100

    if @peak is @bottom
      if @bottom is 0
        @peak = 100
      else
        @peak = Math.abs(@bottom) * 2

  serialize: ->
    se = {}
    se._idCounter = @_idCounter
    se.chronologyLength = @chronologyLength
    se.chronology = {}
    se.chronology.points = points = []

    points.push item.serialize() for item in @chronology when item instanceof Point
    se.chronology.connectors = connectors = []
    connectors.push item.serialize() for item in @chronology when item instanceof Connector

    se

  loadFrom: (se) ->
    @_idCounter = se._idCounter
    @chronologyLength = Number se.chronologyLength

    for item in se.chronology.points
      Point.constructFrom item, @

    for item in se.chronology.connectors
      Connector.constructFrom item, @

    do @done
    return

  _pointExistsAt: (t) ->
    @_getPointAt(t)?

  _getPointAt: (t) ->
    index = @_getIndexOfItemBeforeOrAt t
    item = @_getItemByIndex index

    return unless item?

    if item.isConnector()
      item = @_getItemByIndex index - 1

    return null if item.t isnt t
    item

  _connectorExistsAt: (t) ->
    index = @_getIndexOfItemBeforeOrAt t
    item = @_getItemByIndex index

    return no unless item?
    return no unless item.isConnector()

    item.t is t

  _injectPointOn: (point, index) ->
    @_injectItemOn point, index
    return

  _injectConnectorOn: (connector, index) ->
    @_injectItemOn connector, index
    return

  _pluckPointOn: (point, index) ->
    @_pluckItemOn index
    return

  _pluckConnectorOn: (connector, index) ->
    @_pluckItemOn index
    return

  addPoint: (t, val, leftHandlerX, leftHandlerY, rightHandlerX, rightHandlerY) ->
    @_idCounter++
    p = new Point @, @prop.id + '-point-' + @_idCounter, t, val, leftHandlerX, leftHandlerY, rightHandlerX, rightHandlerY
    @_addPoint p

    p

  _addPoint: (p) ->
    @_emit 'new-point', p
    return

  addConnector: (t) ->
    @_idCounter++
    c = new Connector @,  @prop.id + '-connector-' + @_idCounter, t
    @_addConnector c

    c

  _addConnector: (c) ->
    @_emit 'new-connector', c
    return

  addMultiple: (items, t = 0) ->
    for point in items.points
      point.t += t
      Point.constructFrom point, @

    for connector in items.connectors
      connector.t += t
      Connector.constructFrom connector, @

    return

  done: ->
    do @_recalculatePeakAndBottom
    super
    return

  _recalculatePeakAndBottom: ->
    bottom = @prop.initial
    peak = @prop.initial

    if @chronology.length is 0
      bottom = 0
      peak = 100
    else
      vals = []
      connectionExistsOnLeft = no

      for item in @chronology
        continue if item instanceof Connector

        vals.push item.value
        vals.push item.value + item.leftHandler[1] if connectionExistsOnLeft

        connectionExistsOnLeft = no
        if item.isConnectedToTheRight()
          connectionExistsOnLeft = yes
          vals.push item.value + item.rightHandler[1]

      peak = Math.max.apply Math, vals
      bottom = Math.min.apply Math, vals

      unless Number.isFinite(peak) and Number.isFinite(bottom)
        bottom = 0
        peak = 100
      else if peak is bottom
        if bottom is 0
          peak = 100
        else
          peak = bottom * 2

    unless bottom is @bottom and peak is @peak
      @peak = peak
      @bottom = bottom

      @_emit 'peak-and-bottom-change'

    return

  getPointsInRange: (from, to) ->
    points = []
    for item in @chronology
      break if item.t > to
      continue if item.t < from
      continue unless item.isPoint()
      points.push item

    points

  getOrMakePointOnOrInVicinity: (t, tolerance) ->
    points = @getPointsInRange t - tolerance, t + tolerance
    point = null
    lastDistance = Infinity
    for p in points
      distance = Math.abs p.t - t
      if distance < lastDistance
        point = p
        lastDistance = distance

    unless point?
      val = @prop.getValueAt t
      point = @addPoint t, val, 10, 0, 10, 0

    point

  getSelection: (from, to) ->
    new PacSelection @, from, to

  getValueAt: (t) ->
    index = @_getIndexOfItemBeforeOrAt t
    item = @_getItemByIndex index
    return unless item?
    return item.value if item.isPoint()
    item.tickAt t