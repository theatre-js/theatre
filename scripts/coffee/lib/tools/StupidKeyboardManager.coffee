module.exports = class StupidKeyboardManager

	@keys:

		' ': 32

	self = @

	constructor: ->

		window.addEventListener 'keydown', (e) =>

			@_handleKeydown e

		@_listeners = {}

	_handleKeydown: (e) ->

		listeners = @_listeners[e.keyCode]

		return unless listeners?

		for listener in listeners

			@_runListenerForE listener, e

		return

	_runListenerForE: (listener, e) ->

		return if listener.ctrl and not e.ctrlKey

		return if listener.alt and not e.altKey

		return if listener.shift and not e.shiftKey

		listener.cb e

		return

	on: (keyName, options = {}, cb) ->

		keyCode = self.keys[keyName]

		unless keyCode?

			throw Error "Don't know the keycode to '#{keyName}'"

		unless @_listeners[keyCode]?

			@_listeners[keyCode] = []

		listener =

			cb: cb

			options: options

		@_listeners[keyCode].push listener

		return