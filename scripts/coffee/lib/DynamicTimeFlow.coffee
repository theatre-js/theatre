###*
 * Right now:
 *  - No incremental props
 *  - No lonely points, only beziers
 *  - Beziers are all linear
 *  - Only going forward
 *  - No dynamicism
###

PacsManager = require './dynamic/PacsManager'
BezierRunner = require './dynamic/BezierRunner'

module.exports = class DynamicTimeFlow

	constructor: ->

		@maxTickLength = 25 #ms

		@_lastT = 0

		@_startAt = 0

		@_arrays = {}

		@_regularProps = {}

		@pacs = new PacsManager @

		@_beziers = []

		@_currentBezier = 0

		@_currentActions = {}

	startAt: (t) ->

		@_startAt = t

		return

	addArray: (name, array) ->

		@_arrays[name] = array

		@

	addRegularProp: (name, arrayName, indexInArray) ->

		@_regularProps[name] = [arrayName, indexInArray]

		@

	goto: (t) ->

		t -= @_startAt

		if t < @_lastT

			@_goBackwardTo t

		else

			@_goForwardTo t

		@_lastT = t

		return

	_goForwardTo: (t) ->

		while (bezier = @_beziers[@_currentBezier]) and bezier? and bezier.fromT <= t

			prop = @_regularProps[bezier.prop]

			array = @_arrays[prop[0]]

			indexInArray = prop[1]

			@_currentActions[bezier.prop] = new BezierRunner array, indexInArray, bezier.fromT, bezier.fromVal, bezier.toT, bezier.toVal

			@_currentBezier++

		@_runCurrentActionsForward t

		return

	_runCurrentActionsForward: (t) ->

		for prop, updater of @_currentActions

			unless updater.runAt t

				delete @_currentActions[prop]

				console.log @_currentActions

		return