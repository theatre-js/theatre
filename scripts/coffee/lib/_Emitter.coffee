array = require 'utila/scripts/js/lib/array'

module.exports = class _Emitter

	constructor: ->

		@_listeners = {}

	on: (eventName, listener) ->

		unless @_listeners[eventName]?

			@_listeners[eventName] = []

		@_listeners[eventName].push listener

		@

	removeEvent: (eventName, listener) ->

		return @ unless @_listeners[eventName]?

		array.pluckOneItem @_listeners[eventName], listener

		@

	removeListeners: (eventName) ->

		return @ unless @_listeners[eventName]?

		@_listeners[eventName].length = 0

		@

	_emit: (eventName, data) ->

		return unless @_listeners[eventName]?

		for listener in @_listeners[eventName]

			listener data

		return