module.exports = class IncrementalIsolate

	constructor: (@timeFlow, @id, @isolate) ->

		@_props = []

		@_hadUpdates = no

		@_updateFrom = Infinity

		@t = 0

	_addProp: (prop) ->

		@_props.push prop

		return

	_reportUpdate: (from, to) ->

		@_hadUpdates = yes

		@_updateFrom = Math.min(@_updateFrom, from)

		return

	_tickForTimeFlow: (t) ->

		@isolate.requestTick t, @_hadUpdates, @_updateFrom

		@_hadUpdates = no

		@_updateFrom = Infinity

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