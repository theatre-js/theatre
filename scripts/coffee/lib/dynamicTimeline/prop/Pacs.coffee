array = require 'utila/scripts/js/lib/array'
Point = require './pacs/Point'
Connector = require './pacs/Connector'
_Emitter = require '../../_Emitter'

module.exports = class Pacs extends _Emitter

	constructor: (@prop) ->

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

		@chronology = []

		@chronologyLength = 0

		@_updateRange = [Infinity, -Infinity]

		@_idCounter = -1

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

	_getIndexOfItemBeforeOrAt: (t) ->

		lastIndex = -1

		for item, index in @chronology

			break if item.t > t

			lastIndex = index

		lastIndex

	_setUpdateRange: (from, to) ->

		@_updateRange[0] = Math.min(@_updateRange[0], from)
		@_updateRange[1] = Math.max(@_updateRange[1], to)

		return

	_reportUpdate: ->

		if @_updateRange[0] is Infinity and @_updateRange[1] is -Infinity

			return

		@prop._reportUpdate @_updateRange[0], @_updateRange[1]

		@_updateRange[0] = Infinity
		@_updateRange[1] = -Infinity

		return

	_getItemByIndex: (index) ->

		@chronology[index]

	_pointExistsAt: (t) ->

		@_getPointAt(t)?

	_getPointAt: (t) ->

		index = @_getIndexOfItemBeforeOrAt t

		item = @_getItemByIndex index

		return unless item?

		if item.isConnector()

			item = @_getItemByIndex index - 1

		return null if item.t isnt t

		return item

	_getItemIndex: (item) ->

		@chronology.indexOf item

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

	_injectItemOn: (item, index) ->

		array.injectInIndex @chronology, index, item

		return

	_pluckPointOn: (point, index) ->

		@_pluckItemOn index

		return

	_pluckConnectorOn: (connector, index) ->

		@_pluckItemOn index

		return

	_pluckItemOn: (index) ->

		array.pluck @chronology, index

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

		c = new Connector @, t, @prop.id + '-connector-' + @_idCounter

		@_addConnector c

		c

	_addConnector: (c) ->

		@_emit 'new-connector', c

		return

	done: ->

		do @_recalculatePeakAndBottom

		do @_recalculateLength

		do @_reportUpdate

		return

	_recalculateLength: ->

		lastPoint = @chronology[@chronology.length - 1]

		if lastPoint?

			@prop.timeline._maximizeDuration lastPoint.t

			if lastPoint.t isnt @chronologyLength

				@chronologyLength = lastPoint.t

				@_emit 'duration-change'

		return

	_recalculatePeakAndBottom: ->

		bottom = @prop.initial
		peak = @prop.initial

		if @chronology.length is 0

			bottom = 0
			peak = 100

		else

			vals = []

			for item in @chronology

				continue if item instanceof Connector

				vals.push item.value
				vals.push item.value + item.leftHandler[1]
				vals.push item.value + item.rightHandler[1]

			peak = Math.max.apply Math, vals
			bottom = Math.min.apply Math, vals

			unless Number.isFinite(peak) and Number.isFinite(bottom)

				bottom = 0
				peak = 100

			else if peak is bottom

				peak = bottom * 2

		unless bottom is @bottom and peak is @peak

			@peak = peak
			@bottom = bottom

			@_emit 'peak-and-bottom-change'

		return