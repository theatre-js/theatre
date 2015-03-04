View = require './View'
Model = require './Model'

module.exports = class ScrollableArea
	@type: 'global'
	@instantiateWithInstantiationOf: 'studio-timelineEditor'
	@globalDeps:
		studio: 'studio'

	initialize: (@editor) ->
		@model = new Model @
		@view = new View @