_PacsTimelineItem = require './_PacsTimelineItem'

module.exports = class Point extends _PacsTimelineItem

	constructor: (@pacs, @id, @t, @value, leftHandlerX, leftHandlerY, rightHandlerX, rightHandlerY) ->

		@handler = new Float32Array 4

		@leftHandler = @handler.subarray 0, 2
		@rightHandler = @handler.subarray 2, 4

		@_setHandlers leftHandlerX, leftHandlerY, rightHandlerX, rightHandlerY

		super

		do @_putOnTime

	_putOnTime: ->

		# first, lets make sure no point sits at t
		if @pacs._pointExistsAt @t

			throw Error "Another point already exists at t:#{@t}"

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
			@pacs._setUpdateRange @t, if nextItem? then nextItem.t else Infinity

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

		@_emit 'remove'

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

	canConnect: ->

		@canConnectToLeft() or @canConnectToRight()

	canConnectToLeft: ->

		@hasLeftPoint() and not @isConnectedToTheLeft()

	canConnectToRight: ->

		@hasRightPoint() and not @isConnectedToTheRight()

	connectToRight: ->

		unless @canConnectToRight()

			throw Error "Cannot connect to right"

		@pacs.addConnector @t

		@

	connectToLeft: ->

		unless @canConnectToLeft()

			throw Error "Cannot connect to left"

		@pacs.addConnector @getLeftPoint().t

		@

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

		@_emit 'value-change'

		if @isConnectedToTheLeft()

			@getLeftConnector()._bezierShouldChange()

		if @isConnectedToTheRight()

			@getRightConnector()._bezierShouldChange()

		return

	_setHandlers: (x1, y1, x2, y2) ->

		@_setLeftHandler x1, y1
		@_setRightHandler x2, y2

		return

	_setLeftHandler: (x, y) ->

		unless Number.isFinite(x) and Number.isFinite(y)

			throw Error "Handlers should both be finite numbers"

		if x < 0

			throw Error "Handler must be a positive number"

		@leftHandler[0] = x
		@leftHandler[1] = y

		return

	_setRightHandler: (x, y) ->

		unless Number.isFinite(x) and Number.isFinite(y)

			throw Error "Handlers should both be finite numbers"

		if x < 0

			throw Error "Handler must be a positive number"

		@rightHandler[0] = x
		@rightHandler[1] = y

		return

	setLeftHandler: (x, y) ->

		@_setLeftHandler x, y

		@_emit 'handler-change'

		if @isConnectedToTheLeft()

			@getLeftConnector()._bezierShouldChange()

			@pacs._setUpdateRange @getLeftPoint().t, @t

		return

	setRightHandler: (x, y) ->

		@_setRightHandler x, y

		@_emit 'handler-change'

		updatedFrom = @t
		updatedTo = Infinity

		if @isConnectedToTheRight()

			@getRightConnector()._bezierShouldChange()

			updatedTo = @getRightPoint().t

			@pacs._setUpdateRange updatedFrom, updatedTo

		return

	setBothHandlers: (x1, y1, x2, y2) ->

		@_setHandlers x1, y1, x2, y2

		@_emit 'handler-change'

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

	setTime: (t) ->

		oldT = @t
		diff = t - @t

		wasConnectedToLeft = @isConnectedToTheLeft()
		wasConnectedToRight = @isConnectedToTheRight()
		leftBound = 0
		rightBound = Infinity

		if @hasLeftPoint()

			oldLeftPoint = @getLeftPoint()
			leftBound = oldLeftPoint.t

		if @hasRightPoint()

			oldRightPoint = @getRightPoint()
			rightBound = oldRightPoint.t

		if wasConnectedToLeft

			@getLeftConnector().remove()

		if wasConnectedToRight

			@getRightConnector().remove()

		# remove the point first
		@pacs._pluckPointOn @, @_getIndex()

		@t = t

		do @_putOnTime

		if leftBound < @t < rightBound

			console.log 'in bound', leftBound, rightBound

			if wasConnectedToLeft

				@pacs.addConnector oldLeftPoint.t

			if wasConnectedToRight

				@pacs.addConnector @t

		else

			if wasConnectedToLeft and wasConnectedToRight

				@pacs.addConnector oldLeftPoint.t

			if diff < 0

				if wasConnectedToLeft and oldLeftPoint.getLeftPoint() is @ and not @isConnectedToTheRight()

					@pacs.addConnector @t

			else

				if wasConnectedToRight and oldRightPoint.getRightPoint() is @ and not @isConnectedToTheLeft()

					@pacs.addConnector oldRightPoint.t

		@_emit 'time-change'

		@