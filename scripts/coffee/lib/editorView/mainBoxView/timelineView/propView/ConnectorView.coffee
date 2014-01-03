Foxie = require 'foxie'
_ItemView = require './_ItemView'

module.exports = class ConnectorView extends _ItemView

	constructor: (@prop, @model) ->

		super

		@leftX = 0
		@rightX = 0

		@leftY = 0
		@rightY = 0

		@clicks = @prop.clicks

		@svgArea = @prop.svgArea

		@pacs = @model.pacs

		do @_prepareNode

	_prepareNode: ->

		@node = Foxie('svg:path').putIn(@svgArea.node)
		.attr('stroke', '#367c89')
		.attr('stroke-width', '4px')
		.attr('fill', 'transparent')

		do @_redrawCurve

	relayHorizontally: ->

		@leftX = @model.leftT * @prop._widthToTimeRatio

		@rightX = @model.rightT * @prop._widthToTimeRatio

		baseLeftValue = @model.leftValue - @model.pacs.bottom

		@leftY = baseLeftValue * @prop._heightToValueRatio

		baseRightValue = @model.rightValue - @model.pacs.bottom

		@rightY = baseRightValue * @prop._heightToValueRatio

		do @_redrawCurve

		return

	relayVertically: ->

		do @_redrawCurve

		return

	_redrawCurve: ->

		leftY = @svgArea.height - @leftY

		endY = @svgArea.height - @rightY

		@node.attr 'd', "M#{@leftX} #{leftY} L #{@rightX} #{endY}"

		return