_Emitter = require '../../../_Emitter'

module.exports = class WorkspacePropHolderModel extends _Emitter

	self = @

	constructor: (@workspace, @actorProp) ->

		super

		@rootModel = @workspace.rootModel

		@id = @actorProp.id

		@_expanded = yes

		@_height = 80

	serialize: ->

		se = {}

		se.id = @id

		se._expanded = @_expanded

		se.actorPropId = @actorProp.id

		se._height = @_height

		se

	@constructFrom: (se, workspace) ->

		actorProp = workspace.rootModel.graph.getActorPropById se.actorPropId

		propHolder = new self workspace, actorProp

		if se._expanded?

			propHolder.setExpansion Boolean se._expanded

		if se._height?

			propHolder.setHeight parseInt se._height

		propHolder

	isExpanded: ->

		@_expanded

	setExpansion: (newExpansion) ->

		return if newExpansion is @_expanded

		@_expanded = Boolean newExpansion

		@_emit 'expansion-toggle'

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

	removeFromWorkspace: ->

		@workspace.removeProp @actorProp

		@

	shiftUp: ->

		@workspace._shiftPropUp @actorProp

		@

	shiftDown: ->

		@workspace._shiftPropDown @actorProp

		@