Model = require './Model'
Presenter = require './Presenter'

module.exports = class Editor
	@type: 'local'
	@globalDeps:
		studio: 'studio'

	constructor: (@manager, @id) ->
		@model = new Model this
		@view = new Presenter this