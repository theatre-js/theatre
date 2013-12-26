Actor = require './category/Actor'
_Emitter = require '../../../_Emitter'

module.exports = class Category extends _Emitter

	constructor: (@structure, @name) ->

		super

		@id = @structure.model.id + '-' + @name

		@actors = {}

	getActor: (name) ->

		unless @actors[name]?

			@actors[name] = new Actor @, name

			@_emit 'new-actor', @actors[name]

		@actors[name]