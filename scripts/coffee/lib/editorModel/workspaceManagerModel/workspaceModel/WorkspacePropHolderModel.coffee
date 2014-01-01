_Emitter = require '../../../_Emitter'

module.exports = class WorkspacePropHolderModel extends _Emitter

	constructor: (@workspace, @actorProp) ->

		super

		@id = @actorProp.id

		@_expanded = no

	isExpanded: ->

		@_expanded

	toggleExpansion: ->

		@_expanded = not @_expanded

		return @_expanded