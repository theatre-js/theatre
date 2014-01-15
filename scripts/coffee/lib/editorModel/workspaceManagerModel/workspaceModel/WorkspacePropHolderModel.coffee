_Emitter = require '../../../_Emitter'

module.exports = class WorkspacePropHolderModel extends _Emitter

	self = @

	constructor: (@workspace, @actorProp) ->

		super

		@rootModel = @workspace.rootModel

		@id = @actorProp.id

		@_expanded = yes

		@_height = 180

	serialize: ->

		se = {}

		se.id = @id

		se._expanded = @_expanded

		se.actorPropId = @actorProp.id

		se

	@constructFrom: (se, workspace) ->

		actorProp = workspace.rootModel.graph.getActorPropById se.actorPropId

		propHolder = new self workspace, actorProp

		propHolder._expanded = Boolean se._expanded

		propHolder

	isExpanded: ->

		@_expanded

	toggleExpansion: ->

		@_expanded = not @_expanded

		@_emit 'expansion-toggle'

		return @_expanded

	getHeight: ->

		@_height

	setHeight: (newHeight) ->

		return if newHeight is @_height

		@_height = parseInt(newHeight)|0

		@_emit 'height-change'

		return