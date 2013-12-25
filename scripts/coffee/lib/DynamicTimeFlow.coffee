###*
 * Right now:
 *  - No incremental props
###

RegularProp = require './dynamic/RegularProp'

module.exports = class DynamicTimeFlow

	constructor: (@id = 'timeflow') ->

		@maxTickLength = 25 #ms

		@_lastT = 0

		@_startAt = 0

		@_arrays = {}

		@_props = {}

		@_propsDone = no

	addArray: (name, array) ->

		if @_arrays[name]?

			throw Error "An array named '#{name}' already exists"

		@_arrays[name] = array

		@

	_verifyPropAdd: (name, arrayName) ->

		if @_propsDone

			throw Error "Cannot add props after calling DynamicTimeFlow.propsDone()"

		if @_props[name]?

			throw Error "A prop named '#{name}' already exists"

		unless @_arrays[arrayName]

			throw Error "Couldn't find array named '#{arrayName}'"

		return

	addRegularProp: (name, arrayName, indexInArray, initial) ->

		@_verifyPropAdd name, arrayName

		@_props[name] = new RegularProp @, name, arrayName, indexInArray, initial

		@

	getProp: (name) ->

		unless @_propsDone

			throw Error "You cannot access any prop before calling propsDone()"

		@_props[name]

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