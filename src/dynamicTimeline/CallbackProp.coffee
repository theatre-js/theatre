Prop = require './Prop'

module.exports = class CallbackProp extends Prop

	constructor: (timeline, id, @initial = 0.0, cb) ->

		super

		@_callbacks = []

		@_val = @initial

		if typeof cb is 'function'
			@onChange cb

	_set: (val) ->

		@_val = val

		for cb in @_callbacks

			cb val

		return

	onChange: (cb) ->

		@_callbacks.push cb

		this

	getValue: ->

		@_val