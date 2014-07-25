El = require 'stupid-dom-interface'

module.exports = class ScrollableAreaView

	constructor: (@scrollableArea) ->

		@model = @scrollableArea.model

		do @_prepareContainer

	_prepareContainer: ->

		@containerNode = El '.theatrejs-timelineBox-scrollableArea'
		.inside @scrollableArea.box.view.containerNode