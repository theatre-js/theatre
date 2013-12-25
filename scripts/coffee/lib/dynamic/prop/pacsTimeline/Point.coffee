_PacsTimelineItem = require './_PacsTimelineItem'
array = require 'utila/scripts/js/lib/array'

module.exports = class Point extends _PacsTimelineItem

	constructor: (@prop, @id, @t, @value, @leftHandler, @rightHandler) ->

		super

		# first, lets make sure no point sits at t
		if @prop._pointExistsAt @t

			throw Error "Another point already exists at t"

		prevIndex = @prop._getIndexOfItemBeforeOrAt @t

		prevItem = @prop._getItemByIndex prevIndex

		index = prevIndex + 1

		# now lets see if we are in between a connector
		if prevItem? and prevItem.isConnector()

			# we're in between a connector

			# let's inject this point inside the timeline...
			array.injectInIndex @prop.timeline, index, @

			prevItem._bezierShouldChange()

			# ... and add a connector right after it
			newConnectorIndex = index + 1

			@prop.addConnector @t

			# the timeline has changed from the previous point, to the next point
			prevPoint = @prop._getItemByIndex prevIndex - 1
			nextPoint = @prop._getItemByIndex newConnectorIndex + 1

			@prop._setUpdateRange prevPoint.t, nextPoint.t

		else

			# we're not between a connector

			# let's inject this point inside the timeline
			array.injectInIndex @prop.timeline, index, @

			nextItem = @prop._getItemByIndex index + 1

			# the timeline has changed from this t, to the next point's t
			@prop._setUpdateRange t, if nextItem? then nextItem.t else Infinity

	remove: ->

		updatedFrom = @t
		updatedTo = Infinity

		# if we are connected to a point to the left
		if @hasLeftPoint() and @isConnectedToTheLeft()

			@getLeftConnector().remove()

			updatedFrom = @getLeftPoint().t

		if @isConnectedToTheRight()

			@getRightConnector().remove()

			updatedTo = @getRightPoint().t

		else if @hasRightPoint()

			updatedTo = @getRightPoint().t

		@prop._setUpdateRange updatedFrom, updatedTo

		# remove the point first
		array.pluck @prop.timeline, @_getIndex()

		do @_remove

		return

	_remove: ->

		@_fire 'remove'

		@prop = null

		return

	isConnector: -> no

	isPoint: -> yes

	_getIndex: ->

		i = @prop._getItemIndex @

		if i is -1

			throw Error "This point doesn't reside in the timeline anymore"

		i

	getLeftConnector: ->

		item = @prop._getItemByIndex @_getIndex() - 1

		if item? and item.isConnector()

			return item

		return

	getRightConnector: ->

		item = @prop._getItemByIndex @_getIndex() + 1

		if item? and item.isConnector()

			return item

		return

	isConnectedToTheLeft: ->

		@getLeftConnector()?

	isConnectedToTheRight: ->

		@getRightConnector()?

	getLeftPoint: ->

		if @isConnectedToTheLeft()

			@prop._getItemByIndex @_getIndex() - 2

		else

			@prop._getItemByIndex @_getIndex() - 1

	hasLeftPoint: ->

		@getLeftPoint()?

	getRightPoint: ->

		if @isConnectedToTheRight()

			@prop._getItemByIndex @_getIndex() + 2

		else

			@prop._getItemByIndex @_getIndex() + 1

	hasRightPoint: ->

		@getRightPoint()?

	setValue: (value) ->

		return if value is @value

		@value = value

		updatedFrom = @t
		updatedTo = Infinity

		if @isConnectedToTheLeft()

			updatedFrom = @getLeftPoint().t

		nextPoint = @getRightPoint()

		if nextPoint?

			updatedTo = nextPoint.t

		@prop._setUpdateRange updatedFrom, updatedTo

		@_fire 'value-changed'

		if @isConnectedToTheLeft()

			@getLeftConnector()._bezierShouldChange()

		if @isConnectedToTheRight()

			@getRightConnector()._bezierShouldChange()

		return

	setLeftHandler: (x, y) ->

		return if @leftHandler[0] is x and @leftHandler[1] is y

		@leftHandler[0] = x
		@leftHandler[1] = y

		@_fire 'handler-change'

		if @isConnectedToTheLeft()

			@getLeftConnector()._bezierShouldChange()

			@prop._setUpdateRange @getLeftPoint().t, @t

		return

	setRightHandler: (x, y) ->

		return if @rightHandler[0] is x and @rightHandler[1] is y

		@rightHandler[0] = x
		@rightHandler[1] = y

		@_fire 'handler-change'

		updatedFrom = @t
		updatedTo = Infinity

		if @isConnectedToTheRight()

			@getRightConnector()._bezierShouldChange()

			updatedTo = @getRightPoint().t

			@prop._setUpdateRange updatedFrom, updatedTo

		return

	setBothHandlers: (p1x, p1y, p2x, p2y) ->

		@leftHandler[0] = p1x
		@leftHandler[1] = p1y

		@rightHandler[0] = p2x
		@rightHandler[1] = p2y

		@_fire 'handler-change'

		updatedFrom = @t
		updatedTo = Infinity

		if @isConnectedToTheRight()

			@getRightConnector()._bezierShouldChange()

			updatedTo = @getRightPoint().t

		if @isConnectedToTheLeft()

			@getLeftConnector()._bezierShouldChange()

			updatedFrom = @getLeftPoint().t

		if @isConnectedToTheLeft() or @isConnectedToTheRight()

			@prop._setUpdateRange updatedFrom, updatedTo

		return