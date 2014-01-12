_Emitter = require '../../../_Emitter'

module.exports = class WorkspacePropHolderModel extends _Emitter

	constructor: (@workspace, @actorProp) ->

		super

		@id = @actorProp.id

		@_expanded = yes

	serialize: ->

		se = {}

		se.id = @id

		se._expanded = @_expanded

		se.actorPropId = @actorProp.id

		se

	isExpanded: ->

		@_expanded

	toggleExpansion: ->

		@_expanded = not @_expanded

		return @_expanded