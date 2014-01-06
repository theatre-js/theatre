array = require 'utila/scripts/js/lib/array'
HoverListener = require './hoverManager/HoverListener'

module.exports = class HoverManager

	constructor: (@clickManager) ->

		@_activeListeners = []

	onHover: (nodeData) ->

		l = new HoverListener @, nodeData

		nodeData.hoverListeners.push l

		l

	handleMouseMove: (e, ancestors) ->

		@_checkMouseLeaveForActiveListeners e, ancestors

		for nodeData in ancestors

			# let's iterate through all of this node's hover listeners
			for listener in nodeData.hoverListeners

				listener._handleMouseMove e

		return

	# calls 'leave' on elements outside the pointer
	_checkMouseLeaveForActiveListeners: (e, ancestors) ->

		for listener in @_activeListeners.slice 0

			listener._checkIfShouldLeave e, ancestors

		return

	_removeListenerFromActiveListenersList: (listener) ->

		array.pluckOneItem @_activeListeners, listener

		return

	_addListenerToActiveListenersList: (listener) ->

		@_activeListeners.push listener

		return