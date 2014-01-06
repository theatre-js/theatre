array = require 'utila/scripts/js/lib/array'
ClickListener = require './buttonManager/ClickListener'

module.exports = class ButtonManager

	constructor: (@clickManager, @keyName, @keyCode) ->

	handleMouseMove: (e, ancestors) ->

		for nodeData in ancestors

			# let's iterate through all of this node's wheel listeners
			for listener in nodeData[@keyName].clickListeners

				listener._handleMouseMove e

		return

	handleMouseDown: (e, ancestors) ->

		for nodeData in ancestors

			# let's iterate through all of this node's wheel listeners
			for listener in nodeData[@keyName].clickListeners

				listener._handleMouseDown e

		return

	handleMouseUp: (e, ancestors) ->

		for nodeData in ancestors

			# let's iterate through all of this node's wheel listeners
			for listener in nodeData[@keyName].clickListeners

				listener._handleMouseUp e

		return

	onClick: (nodeData) ->

		l = new ClickListener @, nodeData

		nodeData[@keyName].clickListeners.push l

		l