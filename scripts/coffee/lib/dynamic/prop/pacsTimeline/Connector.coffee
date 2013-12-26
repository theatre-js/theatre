array = require 'utila/scripts/js/lib/array'
UnitBezier = require 'timing-function/scripts/js/lib/UnitBezier'

_PacsTimelineItem = require './_PacsTimelineItem'

module.exports = class Connector extends _PacsTimelineItem

	constructor: (@prop, @t, @id) ->

		super

		# first, lets make sure no connector sits at t
		if @prop._connectorExistsAt t

			throw Error "Another connector already exists at t"

		# lets find the point that sits before the connector
		prevPointIndex = @prop._getIndexOfItemBeforeOrAt t
		prevPoint = @prop._getItemByIndex prevPointIndex

		# make sure the point sits exactly on this t
		unless prevPoint? and prevPoint.t is t

			throw Error "No point sits at this t"

		nextPointIndex = prevPointIndex + 1
		nextPoint = @prop._getItemByIndex nextPointIndex

		# make sure next point exists
		unless nextPoint? and nextPoint.isPoint()

			throw Error "There is no point to come after the connector"

		array.injectInIndex @prop.timeline, nextPointIndex, @

		# things have changed from the previous point to the next point
		@prop._setUpdateRange t, nextPoint.t

		@bezier = new UnitBezier 0, 0, 0, 0

		do @_recalculateBezier

	isConnector: -> yes

	isPoint: -> no

	remove: ->

		@prop._setUpdateRange @getLeftPoint().t, @getRightPoint().t

		array.pluck @prop.timeline, @getIndex()

		@_remove()

		return

		return

	_remove: ->

		@_fire 'remove'

		return

	getIndex: ->

		@prop._getItemIndex @

	getLeftPoint: ->

		@prop._getItemByIndex(@getIndex() - 1)

	getRightPoint: ->

		@prop._getItemByIndex(@getIndex() + 1)

	_bezierShouldChange: ->

		do @_recalculateBezier

		@_fire 'bezier-changed'

		return

	_recalculateBezier: ->

		left = @getLeftPoint().rightHandler
		right = @getRightPoint().leftHandler

		@bezier.set left[0], left[1], right[0], right[1]

		return