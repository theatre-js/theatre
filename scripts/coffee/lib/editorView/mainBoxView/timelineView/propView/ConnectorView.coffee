Foxie = require 'foxie'
_ItemView = require './_ItemView'

module.exports = class ConnectorView extends _ItemView

	constructor: (@prop, @model) ->

		super

		@leftPoint = new Float32Array 2
		@rightPoint = new Float32Array 2
		@leftHandler = new Float32Array 2
		@rightHandler = new Float32Array 2

		@clicks = @prop.clicks

		@svgArea = @prop.svgArea

		@pacs = @model.pacs

		@model.on 'bezier-change', =>

			do @relayHorizontally

		do @_prepareNode

	_prepareNode: ->

		@node = Foxie('svg:path').putIn(@svgArea.node)
		.attr('stroke', '#367c89')
		.attr('stroke-width', '4px')
		.attr('fill', 'transparent')

		do @relayHorizontally

	relayHorizontally: ->

		@leftPoint[0] = @_timeToX @model.leftT

		@leftPoint[1] = @_valToY @model.leftValue

		@rightPoint[0] = @_timeToX @model.rightT

		@rightPoint[1] = @_valToY @model.rightValue

		@leftHandler[0] = @_timeToX @model.leftT + @model.leftHandler[0]

		@leftHandler[1] = @_valToY @model.leftValue + @model.leftHandler[1]

		@rightHandler[0] = @_timeToX @model.rightT - @model.rightHandler[0]

		@rightHandler[1] = @_valToY @model.rightValue + @model.rightHandler[1]

		do @_redrawCurve

		return

	relayVertically: ->

		do @_redrawCurve

		return

	_redrawCurve: ->

		@node.attr 'd',

			"M#{@leftPoint[0]} #{@leftPoint[1]} C " +
			"#{@leftHandler[0]} #{@leftHandler[1]}, " +
			"#{@rightHandler[0]} #{@rightHandler[1]}, " +
			"#{@rightPoint[0]} #{@rightPoint[1]}"

		return