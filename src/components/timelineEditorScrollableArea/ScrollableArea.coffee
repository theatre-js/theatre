View = require './View'
Model = require './Model'

module.exports = class ScrollableArea
	@type: 'leech'
	@target: 'studio-timelineEditor'
	@globalDeps: {'studio', 'moosh', 'cursor'}

	constructor: (@editor) ->
		@model = new Model this
		@view = new View this