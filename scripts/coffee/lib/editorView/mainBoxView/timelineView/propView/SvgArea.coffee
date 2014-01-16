Foxie = require 'foxie'

module.exports = class SvgArea

	constructor: (@prop) ->

		@height = 0

		@width = 0

		do @_prepareNode

		@prop.pacs.on 'length-change', =>

			do @relayHorizontally

		return

	_prepareNode: ->

		@node = Foxie('svg:svg.theatrejs-timelineEditor-prop-pacs-svgArea')
		.putIn(@prop.pacsNode)

		return

	relayVertically: ->

		return if @prop._height is @height

		@height = @prop._height

		@node.attr 'height', @height + 'px'

		return

	relayHorizontally: ->

		newWidth = @prop.pacs.chronologyLength * @prop._widthToTimeRatio

		return if newWidth < @width

		@width = newWidth * 1.5

		@node.attr 'width', @width + 'px'

		return