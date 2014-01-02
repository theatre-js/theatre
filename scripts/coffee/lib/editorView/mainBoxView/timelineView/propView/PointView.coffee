Foxie = require 'foxie'

module.exports = class PointView

	constructor: (@prop, @model) ->

		do @_prepareNode

		do @relayHorizontally

		do @relayVertically

	_prepareNode: ->

		@node = Foxie('.pointy').putIn @prop.pacsNode

	relayHorizontally: ->

		newX = @model.t * @prop._widthToTimeRatio

		@node.moveXTo newX

		return

	relayVertically: ->

		baseVal = @model.value - @model.pacs.bottom

		newY = baseVal * @prop._heightToValueRatio

		@node.moveYTo -newY

		return