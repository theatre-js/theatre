_Emitter = require '../../../_Emitter'

module.exports = class WorkspacePropHolderModel extends _Emitter

	self = @

	constructor: (@workspace, @actorProp) ->

		super

		@rootModel = @workspace.rootModel

		@id = @actorProp.id

		@_expanded = yes

	serialize: ->

		se = {}

		se.id = @id

		se._expanded = @_expanded

		se.actorPropId = @actorProp.id

		se

	@constructFrom: (se, workspace) ->

		actorProp = workspace.rootModel.graph.getActorPropById se.actorPropId

		new self workspace, actorProp

	isExpanded: ->

		@_expanded

	toggleExpansion: ->

		@_expanded = not @_expanded

		return @_expanded