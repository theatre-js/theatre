###*
 * Right now:
 *  - No incremental props
 *  - No lonely points, only beziers
 *  / Beziers are all linear
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

		@_props = {}

		@_propsDone = no

		@pacs = new PacsManager @

	addArray: (name, array) ->

		if @_arrays[name]?

			throw Error "An array named '#{name}' already exists"

		@_arrays[name] = array

		@

	addRegularProp: (name, arrayName, indexInArray, initial) ->

		if @_propsDone

			throw Error "Cannot add props after calling DynamicTimeFlow.propsDone()"

		if @_props[name]?

			throw Error "A prop named '#{name}' already exists"

		unless @_arrays[arrayName]

			throw Error "Couldn't find array named '#{arrayName}'"

		@_props[name] = new RegularProp @, name, arrayName, indexInArray, initial

		@

	propsDone: ->

		if @_propsDone

			throw Error "Cannot call propsDone() twice."

		@_propsDone = yes

		return

	goto: (t) ->

		t -= @_startAt

		if t < @_lastT

			@_goBackwardTo t

		else

			@_goForwardTo t

		@_lastT = t

		return

	_goForwardTo: (t) ->

		for name, prop of @_props

			prop._goForwardTo t

		return