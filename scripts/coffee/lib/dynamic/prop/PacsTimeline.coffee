array = require 'utila/scripts/js/lib/array'
Point = require './pacsTimeline/Point'
Connector = require './pacsTimeline/Connector'

module.exports = class PacTimeline

	constructor: (@prop) ->

		@timeline = []

	_getIndexOfItemBeforeOrAt: (t) ->

		lastIndex = -1

		for item, index in @timeline

			break if item.t > t

			lastIndex = index

		lastIndex

	_reportUpdate: (from, to) ->

		@prop._reportUpdate from, to

		return

	getItemByIndex: (index) ->

		@timeline[index]

	getPointAt: (t) ->

	itemExistsAt: (t) ->

		index = @_getIndexOfItemBeforeOrAt t

		item = @getItemByIndex index

		return no unless item?

		item.t is t

	pointExistsAt: (t) ->

		item = @getPointAt t

		return no unless item?

		item.t is t

	getPointAt: (t) ->

		index = @_getIndexOfItemBeforeOrAt t

		item = @getItemByIndex index

		return unless item?

		if item.isConnector()

			return @getItemByIndex index - 1

		else

			return item

	getItemIndex: (item) ->

		@timeline.indexOf item

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
		if prevItem? and prevItem.isConnector()

			# we're in between a connector

			# let's inject this point inside the timeline...
			array.injectInIndex @timeline, pointIndex, point

			# ... and add a connector right after it
			newConnectorIndex = pointIndex + 1
			array.injectInIndex @timeline, newConnectorIndex, new Connector t

			# the timeline has changed from the previous point, to the next point
			prevPoint = @getItemByIndex prevIndex - 1
			nextPoint = @getItemByIndex newConnectorIndex + 1

			@_reportUpdate prevPoint.t, nextPoint.t

		else

			# we're not between a connector

			# let's inject this point inside the timeline
			array.injectInIndex @timeline, pointIndex, point

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
		array.injectInIndex @timeline, connectorIndex, new Connector t

		# things have changed from the previous point to the next point
		@_reportUpdate t, nextPoint.t

		return

	removeConnector: (t) ->

		connectorIndex = @_getIndexOfItemBeforeOrAt t
		connector = @getItemByIndex connectorIndex

		# make sure we have a connector there
		unless connector? and connector.isConnector()

			throw Error "Couldn't find a connector at that time"

		# okay, let's remove the connector
		array.pluck @timeline, connectorIndex

		# the timeline is updated from previous point
		# to the next point
		prevPoint = @getItemByIndex connectorIndex - 1
		nextPoint = @getItemByIndex connectorIndex

		@_reportUpdate prevPoint.t, nextPoint.t

		return

	removePoint: (t) ->

		point = @getPointAt t

		unless point?

			throw Error "Couldn't find a point on that time"

		pointIndex = @getItemIndex point

		# remove the point first
		array.pluck @timeline, pointIndex

		# lets get the previous and next items
		prevItemIndex = pointIndex - 1
		prevItem = @getItemByIndex prevItemIndex

		nextItemIndex = pointIndex

		updatedFrom = point.t
		updatedTo = Infinity

		# if we are connected to a point from the left
		if prevItem? and prevItem.isConnector()

			# remove the connector from the left
			array.pluck @timeline, prevItemIndex

			nextItemIndex -= 1

			updatedFrom = @getItemByIndex(prevItemIndex - 1).t

		nextItem = @getItemByIndex nextItemIndex

		if nextItem?

			# if we are not connected to a point to the right
			if nextItem.isPoint()

				updatedTo = nextItem.t

			# we are connected to a connector to the right
			else

				# remove the connector
				array.pluck @timeline, nextItemIndex

				updatedTo = @getItemByIndex(nextItemIndex).t

		@_reportUpdate updatedFrom, updatedTo

		return

	changePointValues: (t, val, pLeftX, pLeftY, pRightX, pRightY) ->

		point = @getPointAt t

		unless point?

			throw Error "Couldn't find a point on that time"

		# let's update the values first
		point.changeValues val, pLeftX, pLeftY, pRightX, pRightY

		updatedFrom = point.t
		updatedTo = Infinity

		pointIndex = @getItemIndex point

		# if we're connected from the left
		if (connector = @getItemByIndex(pointIndex - 1)) and connector.isConnector()

			updatedFrom = @getItemByIndex(pointIndex - 2).t

		# if there is anything on our right
		if (nextItem = @getItemByIndex(pointIndex + 1)) and nextItem?

			unless nextItem.isPoint()

				nextItem = @getItemByIndex(pointIndex + 2)

			updatedTo = nextItem.t

		@_reportUpdate updatedFrom, updatedTo