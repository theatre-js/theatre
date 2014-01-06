array = require 'utila/scripts/js/lib/array'
WheelListener = require './wheelManager/WheelListener'

module.exports = class WheelManager

	constructor: (@clickManager) ->

	onWheel: (nodeData) ->

		l = new WheelListener @, nodeData

		nodeData.wheelListeners.push l

		l

	handleMouseWheel: (e, ancestors) ->

		for nodeData in ancestors

			# let's iterate through all of this node's wheel listeners
			for listener in nodeData.wheelListeners

				listener._handleMouseWheel e

		return