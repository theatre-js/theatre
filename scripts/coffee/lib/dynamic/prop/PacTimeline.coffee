array = require 'utila/scripts/js/lib/array'
Point = require './pacTimeline/Point'
Connector = require './pacTimeline/Connector'

module.exports = class PacTimeline

	constructor: (@prop) ->

		@timeline = []

	_getIndexOfItemBeforeOrAt: (t) ->

		lastIndex = -1

		for item, index in @timeline

			break if item.t > t

			lastIndex = index

		lastIndex

	getItemByIndex: (index) ->

		@timeline[index]

	itemExistsAt: (t) ->

		index = @_getIndexOfItemBeforeOrAt t

		item = @getItemByIndex index

		return no unless item?

		item.t is t

	pointExistsAt: (t) ->

		index = @_getIndexOfItemBeforeOrAt t

		item = @getItemByIndex index

		return no unless item?

		return no unless item.isPoint()

		item.t is t

	connectorExistsAt: (t) ->

		index = @_getIndexOfItemBeforeOrAt t

		item = @getItemByIndex index

		return no unless item?

		return no unless item.isConnector()

		item.t is t

	addPoint: (t, val, pLeftX, pLeftY, pRightX, pRightY) ->

		# first, lets make sure no point sits at t
		if @pointExistsAt t

			throw Error "Another point already exists at t"

		point = new Point t, val, pLeftX, pLeftY, pRightX, pRightY

		prevIndex = @_getIndexOfItemBeforeOrAt t

		prevItem = @getItemByIndex prevIndex

		pointIndex = prevIndex + 1

		# now lets see if we are in between a connector
		if prevItem.isConnector()

			# we're in between a connector

			# let's inject this point inside the timeline...
			array.injectByIndex @timeline, pointIndex, point

			# ... and add a connector right after it
			newConnectorIndex = pointIndex + 1
			array.injectByIndex @timeline, newConnectorIndex, new Connector t

			# the timeline has changed from the previous point, to the next point
			prevPoint = @getItemByIndex prevIndex - 1
			nextPoint = @getItemByIndex newConnectorIndex + 1

			@_reportUpdate prevPoint.t, nextPoint.t

		else

			# we're not between a connector

			# let's inject this point inside the timeline
			array.injectByIndex @timeline, pointIndex, point

			nextItem = @getItemByIndex pointIndex + 1

			# the timeline has changed from this t, to the next t
			@_reportUpdate t, if nextItem? then nextItem.t else Infinity

		return

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
		connectorIndex = nextPointIndex
		array.injectByIndex @timeline, connectorIndex, new Connector t

		# things have changed from the previous point to the next point
		@_reportUpdate t, nextPoint.t

		return