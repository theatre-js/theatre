Model = require './Model'
View = require './View'

module.exports = class Editor
	@type: 'local'
	@globalDeps:
		studio: 'studio'

	initialize: (@manager, @id) ->
		@model = new Model this
		@view = new View this