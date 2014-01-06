array = require 'utila/scripts/js/lib/array'
DragListener = require './buttonManager/DragListener'
ClickListener = require './buttonManager/ClickListener'

module.exports = class ButtonManager

	constructor: (@clickManager, @keyName, @keyCode) ->

		@_activeListeners = []

	_removeListenerFromActiveListenersList: (listener) ->

		array.pluckOneItem @_activeListeners, listener

		return

	_addListenerToActiveListenersList: (listener) ->

		@_activeListeners.push listener

		return

	handleMouseDown: (e, ancestors) ->

		for nodeData in ancestors

			for listener in nodeData[@keyName].clickListeners

				listener._handleMouseDown e

			for listener in nodeData[@keyName].dragListeners

				listener._handleMouseDown e

			return if @_activeListeners.length > 0

		return

	handleMouseMove: (e, ancestors) ->

		for listener in @_activeListeners

			listener._handleMouseMove e

		return

	handleMouseUp: (e, ancestors) ->

		for listener in @_activeListeners

			listener._handleMouseUp e

		return

	onClick: (nodeData) ->

		l = new ClickListener @, nodeData

		nodeData[@keyName].clickListeners.push l

		l

	onDrag: (nodeData) ->

		l = new DragListener @, nodeData

		nodeData[@keyName].dragListeners.push l

		l