Point = require './Point'
Connector = require './Connector'

module.exports = class PacSelection

	constructor: (@pacs, @from, @to) ->

		do @_init

	_init: ->

		@_items = @pacs.getItemsInRange @from, @to

		@_firstPoint = null

		@_lastPoint = null

		@empty = @_items.length is 0

		@realFrom = @from

		@realTo = @to

		unless @empty

			@_firstPoint = @_items[0]

			lastItem = @_items[@_items.length - 1]

			if lastItem.isConnector()

				@_lastPoint = @_items[@_items.length - 2]

				@_items.pop()

			else

				@_lastPoint = lastItem

			@realFrom = @_firstPoint.t

			@realTo = @_lastPoint.t

	canMoveBy: (delta) ->

		return yes if @empty

		residingItems = @pacs.getItemsInRange @realFrom + delta, @realTo + delta

		nextConnector = @_lastPoint.getRightConnector()

		for item in residingItems

			return no unless (item in @_items or item is nextConnector)

		return yes

	moveBy: (delta) ->

		return if @empty

		pointBefore = @_firstPoint.getLeftPoint()

		wasConnectedToTheLeft = @_firstPoint.isConnectedToTheLeft()

		wasConnectedToTheRight = @_lastPoint.isConnectedToTheRight()

		pointAfter = @_lastPoint.getRightPoint()

		points = []
		connectors = []

		toRemove = []

		for item in @_items

			se = item.serialize()

			if item.isPoint()

				points.push se

				toRemove.push item

			else

				connectors.push se

				toRemove.unshift item

		for item in toRemove

			item.remove()

		for p in points

			p.t += delta

			Point.constructFrom p, @pacs

		for c in connectors

			c.t += delta

			Connector.constructFrom c, @pacs

		@from += delta
		@to += delta

		do @_init

		if wasConnectedToTheLeft and @realFrom > pointBefore.t and (not pointAfter? or @realTo < pointAfter.t)

			@_firstPoint.connectToTheLeft()

		if wasConnectedToTheRight and @realTo < pointAfter.t and (not pointBefore? or @realFrom > pointBefore.t)

			@_lastPoint.connectToTheRight()

		return

	remove: ->

		items = @pacs.getItemsInRange @from, @to

		for item in items

			if item.isConnector()

				item.remove()

		for item in items

			if item.isPoint()

				item.remove()

		do @_init

		return