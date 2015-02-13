module.exports = class IncrementalIsolate

	constructor: (@timeline, @id, @isolate) ->

		@_props = []

		@_hadChanges = no

		@_changedFrom = Infinity

		@t = 0

	_addProp: (prop) ->

		@_props.push prop

		return

	_reportChange: (from, to) ->

		@_hadChanges = yes

		@_changedFrom = Math.min(@_changedFrom, from)

		return

	_tickForTimeline: (t) ->

		@isolate.requestTick t, @_hadChanges, @_changedFrom

		@_hadChanges = no

		@_changedFrom = Infinity

		return

	tick: (t) ->

		if t < @t

			@_tickBackward t

		else

			@_tickForward t

		@t = t

		return

	_tickForward: (t) ->

		for name, prop of @_props

			prop._tickForward t

		return

	_tickBackward: (t) ->

		for name, prop of @_props

			prop._tickBackward t

		return