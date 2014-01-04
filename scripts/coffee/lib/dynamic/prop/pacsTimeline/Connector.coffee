_PacsTimelineItem = require './_PacsTimelineItem'
UnitBezier = require 'timing-function/scripts/js/lib/UnitBezier'

module.exports = class Connector extends _PacsTimelineItem

	constructor: (@pacs, @t, @id) ->

		super

		# first, lets make sure no connector sits at t
		if @pacs._connectorExistsAt t

			throw Error "Another connector already exists at t"

		# lets find the point that sits before the connector
		prevPointIndex = @pacs._getIndexOfItemBeforeOrAt t
		prevPoint = @pacs._getItemByIndex prevPointIndex

		# make sure the point sits exactly on this t
		unless prevPoint? and prevPoint.t is t

			throw Error "No point sits at this t"

		nextPointIndex = prevPointIndex + 1
		nextPoint = @pacs._getItemByIndex nextPointIndex

		# make sure next point exists
		unless nextPoint? and nextPoint.isPoint()

			throw Error "There is no point to come after the connector"

		@pacs._injectConnectorOn @, nextPointIndex

		# things have changed from the previous point to the next point
		@pacs._setUpdateRange t, nextPoint.t

		@bezier = new UnitBezier 0, 0, 0, 0

		do @_recalculateBezier

	isConnector: -> yes

	isPoint: -> no

	remove: ->

		@pacs._setUpdateRange @getLeftPoint().t, @getRightPoint().t

		@pacs._pluckConnectorOn @, @getIndex()

		@_remove()

		return

		return

	_remove: ->

		@_emit 'remove'

		return

	getIndex: ->

		@pacs._getItemIndex @

	getLeftPoint: ->

		@pacs._getItemByIndex(@getIndex() - 1)

	getRightPoint: ->

		@pacs._getItemByIndex(@getIndex() + 1)

	_bezierShouldChange: ->

		do @_recalculateBezier

		@_emit 'bezier-change'

		return

	_recalculateBezier: ->

		leftPoint = @getLeftPoint()
		rightPoint = @getRightPoint()

		@leftHandler = leftPoint.rightHandler
		@rightHandler = rightPoint.leftHandler

		@leftValue = leftPoint.value
		@rightValue = rightPoint.value
		@_valDiff = @rightValue - @leftValue

		@leftT = leftPoint.t
		@rightT = rightPoint.t
		@_timeDiff = @rightT - @leftT

		x1 = @leftHandler[0] / @_timeDiff
		y1 = @leftHandler[1] / @_valDiff

		x2 = @rightHandler[0] / @_timeDiff
		y2 = @rightHandler[1] / @_valDiff

		# if @leftValue > @rightValue

		# 	y1 = - y1
		# 	# y2 = - y2

		@bezier.set x1, y1, x2, y2

		return

	tickAt: (t) ->

		prog = (t - @leftT) / @_timeDiff

		@leftValue + (@_valDiff * @bezier.solveSimple(prog))