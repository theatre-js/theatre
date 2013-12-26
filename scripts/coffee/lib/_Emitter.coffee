module.exports = class _Emitter

	constructor: ->

		@_listeners = {}

	on: (eventName, listener) ->

		unless @_listeners[eventName]?

			@_listeners[eventName] = []

		@_listeners[eventName].push listener

		@

	_emit: (eventName, data) ->

		return unless @_listeners[eventName]?

		for listener in @_listeners[eventName]

			listener data

		return