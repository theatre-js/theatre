_PacsTimelineItem = require './_PacsTimelineItem'
array = require 'utila/scripts/js/lib/array'

module.exports = class Point extends _PacsTimelineItem

	constructor: (@prop, @id, @t, @value, @pLeftX, @pLeftY, @pRightX, @pRightY) ->

		super

	changeValues: (@pLeftX, @pLeftY, @pRightX, @pRightY) ->

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
		array.pluck @prop.timeline, @getIndex()

		do @_remove

		return

	_remove: ->

		@_fire 'remove'

		@prop = null

		return

	isConnector: -> no

	isPoint: -> yes

	getIndex: ->

		i = @prop.getItemIndex @

		if i is -1

			throw Error "This point doesn't reside in the timeline anymore"

		i

	getLeftConnector: ->

		item = @prop.getItemByIndex @getIndex() - 1

		if item? and item.isConnector()

			return item

		return

	getRightConnector: ->

		item = @prop.getItemByIndex @getIndex() + 1

		if item? and item.isConnector()

			return item

		return

	isConnectedToTheLeft: ->

		@getLeftConnector()?

	isConnectedToTheRight: ->

		@getRightConnector()?

	getLeftPoint: ->

		if @isConnectedToTheLeft()

			@prop.getItemByIndex @getIndex() - 2

		else

			@prop.getItemByIndex @getIndex() - 1

	hasLeftPoint: ->

		@getLeftPoint()?

	getRightPoint: ->

		if @isConnectedToTheRight()

			@prop.getItemByIndex @getIndex() + 2

		else

			@prop.getItemByIndex @getIndex() + 1

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

		return