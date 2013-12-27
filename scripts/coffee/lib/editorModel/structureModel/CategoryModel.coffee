ActorModel = require './categoryModel/ActorModel'
_Emitter = require '../../_Emitter'

module.exports = class CategoryModel extends _Emitter

	constructor: (@structure, @name) ->

		super

		@id = @structure.editor.id + '-' + @name

		@actors = {}

	getActor: (name) ->

		unless @actors[name]?

			@actors[name] = new ActorModel @, name

			@_emit 'new-actor', @actors[name]

		@actors[name]