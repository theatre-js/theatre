_PacsTimelineItem = require './_PacsTimelineItem'

module.exports = class Point extends _PacsTimelineItem

	constructor: (@pacs, @id, @t, @value, leftHandlerX, leftHandlerY, rightHandlerX, rightHandlerY) ->

		@leftHandler = [parseFloat(leftHandlerX), parseFloat(leftHandlerY)]
		@rightHandler = [parseFloat(rightHandlerX), parseFloat(rightHandlerY)]

		super

		# first, lets make sure no point sits at t
		if @pacs._pointExistsAt @t

			throw Error "Another point already exists at t"

		prevIndex = @pacs._getIndexOfItemBeforeOrAt @t

		prevItem = @pacs._getItemByIndex prevIndex

		index = prevIndex + 1

		# now lets see if we are in between a connector
		if prevItem? and prevItem.isConnector()

			# we're in between a connector

			# @pacs.
			# let's inject this point inside the timeline...
			@pacs._injectPointOn @, index

			prevItem._bezierShouldChange()

			# ... and add a connector right after it
			newConnectorIndex = index + 1

			@pacs.addConnector @t

			# the timeline has changed from the previous point, to the next point
			prevPoint = @pacs._getItemByIndex prevIndex - 1
			nextPoint = @pacs._getItemByIndex newConnectorIndex + 1

			@pacs._setUpdateRange prevPoint.t, nextPoint.t

		else

			# we're not between a connector

			# let's inject this point inside the timeline
			@pacs._injectPointOn @, index

			nextItem = @pacs._getItemByIndex index + 1

			# the timeline has changed from this t, to the next point's t
			@pacs._setUpdateRange t, if nextItem? then nextItem.t else Infinity

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

		@pacs._setUpdateRange updatedFrom, updatedTo

		# remove the point first
		@pacs._pluckPointOn @, @_getIndex()

		do @_remove

		return

	_remove: ->

		@_fire 'remove'

		@pacs = null

		return

	isConnector: -> no

	isPoint: -> yes

	_getIndex: ->

		i = @pacs._getItemIndex @

		if i is -1

			throw Error "This point doesn't reside in the timeline anymore"

		i

	getLeftConnector: ->

		item = @pacs._getItemByIndex @_getIndex() - 1

		if item? and item.isConnector()

			return item

		return

	getRightConnector: ->

		item = @pacs._getItemByIndex @_getIndex() + 1

		if item? and item.isConnector()

			return item

		return

	isConnectedToTheLeft: ->

		@getLeftConnector()?

	isConnectedToTheRight: ->

		@getRightConnector()?

	getLeftPoint: ->

		if @isConnectedToTheLeft()

			@pacs._getItemByIndex @_getIndex() - 2

		else

			@pacs._getItemByIndex @_getIndex() - 1

	hasLeftPoint: ->

		@getLeftPoint()?

	getRightPoint: ->

		if @isConnectedToTheRight()

			@pacs._getItemByIndex @_getIndex() + 2

		else

			@pacs._getItemByIndex @_getIndex() + 1

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

		@pacs._setUpdateRange updatedFrom, updatedTo

		@_fire 'value-changed'

		if @isConnectedToTheLeft()

			@getLeftConnector()._bezierShouldChange()

		if @isConnectedToTheRight()

			@getRightConnector()._bezierShouldChange()

		return

	setLeftHandler: (x, y) ->

		return if @leftHandler[0] is x and @leftHandler[1] is y

		@leftHandler[0] = parseFloat x
		@leftHandler[1] = parseFloat y

		@_fire 'handler-change'

		if @isConnectedToTheLeft()

			@getLeftConnector()._bezierShouldChange()

			@pacs._setUpdateRange @getLeftPoint().t, @t

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

			@pacs._setUpdateRange updatedFrom, updatedTo

		return

	setBothHandlers: (p1x, p1y, p2x, p2y) ->

		@leftHandler[0] = p1x
		@leftHandler[1] = p1y

		@rightHandler[0] = p2x
		@rightHandler[1] = p2y

		@_fire 'handler-changed'

		updatedFrom = @t
		updatedTo = Infinity

		if @isConnectedToTheRight()

			@getRightConnector()._bezierShouldChange()

			updatedTo = @getRightPoint().t

		if @isConnectedToTheLeft()

			@getLeftConnector()._bezierShouldChange()

			updatedFrom = @getLeftPoint().t

		if @isConnectedToTheLeft() or @isConnectedToTheRight()

			@pacs._setUpdateRange updatedFrom, updatedTo

		return

	tickAt: (t) ->

		return @value