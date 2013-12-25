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

	done: ->

		do @_reportUpdate

		return

	_reportUpdate: ->

		if @_updateRange[0] is Infinity and @_updateRange[1] is -Infinity

			return

		@prop._reportUpdate @_updateRange[0], @_updateRange[1]

		@_updateRange[0] = Infinity
		@_updateRange[1] = -Infinity

		return

	getItemByIndex: (index) ->

		@timeline[index]

	itemExistsAt: (t) ->

		index = @_getIndexOfItemBeforeOrAt t

		item = @getItemByIndex index

		return no unless item?

		item.t is t

	pointExistsAt: (t) ->

		item = @getPointAt t

		return no unless item?

		item.t is t

	_makeConnector: (t) ->

		@_idCounter++

		c = new Connector @, t, @prop.id + '-connector-' + @_idCounter

		@_fire 'new-connector', c

		c

	_makePoint: (t, val, pLeftX, pLeftY, pRightX, pRightY) ->

		@_idCounter++

		p = new Point @, @prop.id + '-connector-' + @_idCounter, t, val, pLeftX, pLeftY, pRightX, pRightY

		@_fire 'new-point', p

		p

	getPointAt: (t) ->

		index = @_getIndexOfItemBeforeOrAt t

		item = @getItemByIndex index

		return unless item?

		if item.isConnector()

			return @getItemByIndex index - 1

		else

			return null if item.t isnt t

			return item

	getConnectorAt: (t) ->

		index = @_getIndexOfItemBeforeOrAt t

		item = @getItemByIndex index

		return unless item?

		return unless item.isConnector() and item.t is t

		return item

	getItemIndex: (item) ->

		@timeline.indexOf item

	connectorExistsAt: (t) ->

		index = @_getIndexOfItemBeforeOrAt t

		item = @getItemByIndex index

		return no unless item?

		return no unless item.isConnector()

		item.t is t

	getConnectorOnIndex: (index) ->

		item = @getItemByIndex index

		if item? and item.isConnector()

			return item

		else

			return

	addPoint: (t, val, pLeftX, pLeftY, pRightX, pRightY) ->

		# first, lets make sure no point sits at t
		if @pointExistsAt t

			throw Error "Another point already exists at t"

		point = @_makePoint t, val, pLeftX, pLeftY, pRightX, pRightY

		prevIndex = @_getIndexOfItemBeforeOrAt t

		prevItem = @getItemByIndex prevIndex

		pointIndex = prevIndex + 1

		# now lets see if we are in between a connector
		if prevItem? and prevItem.isConnector()

			# we're in between a connector

			# let's inject this point inside the timeline...
			array.injectInIndex @timeline, pointIndex, point

			# ... and add a connector right after it
			newConnectorIndex = pointIndex + 1
			array.injectInIndex @timeline, newConnectorIndex, @_makeConnector t

			# the timeline has changed from the previous point, to the next point
			prevPoint = @getItemByIndex prevIndex - 1
			nextPoint = @getItemByIndex newConnectorIndex + 1

			@_setUpdateRange prevPoint.t, nextPoint.t

		else

			# we're not between a connector

			# let's inject this point inside the timeline
			array.injectInIndex @timeline, pointIndex, point

			nextItem = @getItemByIndex pointIndex + 1

			# the timeline has changed from this t, to the next t
			@_setUpdateRange t, if nextItem? then nextItem.t else Infinity

		point

	addConnector: (t) ->

		# first, lets make sure no connector sits at t
		if @connectorExistsAt t

			throw Error "Another connector already exists at t"

		# lets find the point that sits before the connector
		prevPointIndex = @_getIndexOfItemBeforeOrAt t
		prevPoint = @getItemByIndex prevPointIndex

		# make sure the point sits exactly on this t
		unless prevPoint? and prevPoint.t is t

			throw Error "No point sits at this t"

		nextPointIndex = prevPointIndex + 1
		nextPoint = @getItemByIndex nextPointIndex

		# make sure next point exists
		unless nextPoint? and nextPoint.isPoint()

			throw Error "There is no point to come after the connector"

		# all safe, let's make the connector
		connector = @_makeConnector t

		array.injectInIndex @timeline, nextPointIndex, connector

		# things have changed from the previous point to the next point
		@_setUpdateRange t, nextPoint.t

		connector

	_getPointNeighbours: (t) ->

		neighbours =

			leftConnector: null
			leftPoint: null

			rightConnector: null
			rightPoint: null

		point = @getPointAt t

		unless point?

			throw Error "Couldn't find a point on that time"

		pointIndex = @getItemIndex point

		prevItem = @getItemByIndex pointIndex - 1

		if prevItem?

			if prevItem.isPoint()

				neighbours.leftPoint = prevItem

			else

				neighbours.leftConnector = prevItem
				neighbours.leftPoint = @getItemByIndex pointIndex - 2

		nextItem = @getItemByIndex pointIndex + 1

		if nextItem?

			if nextItem.isPoint()

				neighbours.rightPoint = nextItem

			else

				neighbours.rightConnector = nextItem
				neighbours.rightPoint = @getItemByIndex pointIndex + 2

		neighbours

	changePointTime: (t, newT) ->

		point = @getPointAt t

		unless point?

			throw Error "Couldn't find a point on that time"

		pointIndex = @getItemIndex point

		neighbours = @_getPointNeighbours t

