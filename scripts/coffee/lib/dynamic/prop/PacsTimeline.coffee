array = require 'utila/scripts/js/lib/array'
Point = require './pacsTimeline/Point'
Connector = require './pacsTimeline/Connector'
_Emitter = require '../../_Emitter'

module.exports = class PacsTimeline extends _Emitter

	constructor: (@prop) ->

		super

		@peak = @prop.initial
		@bottom = @prop.initial

		@timeline = []

		@_updateRange = [Infinity, -Infinity]

		@_idCounter = -1

	_getIndexOfItemBeforeOrAt: (t) ->

		lastIndex = -1

		for item, index in @timeline

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

		@timeline[index]

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

		@timeline.indexOf item

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

		array.injectInIndex @timeline, index, item

		return

	_pluckPointOn: (point, index) ->

		@_pluckItemOn index

		return

	_pluckConnectorOn: (connector, index) ->

		@_pluckItemOn index

		return

	_pluckItemOn: (index) ->

		array.pluck @timeline, index

		return

	addPoint: (t, val, leftHandlerX, leftHandlerY, rightHandlerX, rightHandlerY) ->

		@_idCounter++

		p = new Point @, @prop.id + '-connector-' + @_idCounter, t, val, leftHandlerX, leftHandlerY, rightHandlerX, rightHandlerY

		@_emit 'new-point', p

		p

	addConnector: (t) ->

		@_idCounter++

		c = new Connector @, t, @prop.id + '-connector-' + @_idCounter

		@_emit 'new-connector', c

		c

	done: ->

		do @_recalculatePeakAndBottom

		do @_recalculateLength

		do @_reportUpdate

		return

	_recalculateLength: ->

		lastPoint = @timeline[@timeline.length - 1]

		if lastPoint?

			@prop.timeFlow._maximizeTimelineLength lastPoint.t

		return

	_recalculatePeakAndBottom: ->

		@bottom = @prop.initial
		@peak = @prop.initial

		for item in @timeline

			continue if item instanceof Connector

			@bottom = Math.min(@bottom, item.value)
			@peak = Math.max(@peak, item.value)

		@_emit 'peak-and-bottom-change'

		return