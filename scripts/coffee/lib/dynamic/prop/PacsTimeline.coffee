array = require 'utila/scripts/js/lib/array'
Point = require './pacsTimeline/Point'
Connector = require './pacsTimeline/Connector'
_Emitter = require '../../_Emitter'

module.exports = class PacTimeline extends _Emitter

	constructor: (@prop) ->

		super

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

		item = @_getPointAt t

		return no unless item?

		item.t is t

	_getPointAt: (t) ->

		index = @_getIndexOfItemBeforeOrAt t

		item = @_getItemByIndex index

		return unless item?

		if item.isConnector()

			return @_getItemByIndex index - 1

		else

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

	addPoint: (t, val, leftHandler, rightHandler) ->

		@_idCounter++

		p = new Point @, @prop.id + '-connector-' + @_idCounter, t, val, leftHandler, rightHandler

		@_fire 'new-point', p

		p

	addConnector: (t) ->

		@_idCounter++

		c = new Connector @, t, @prop.id + '-connector-' + @_idCounter

		@_fire 'new-connector', c

		c

	done: ->

		do @_reportUpdate

		return