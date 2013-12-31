_Emitter = require '../../../_Emitter'

module.exports = class WorkspacePropHolderModel extends _Emitter

	constructor: (@workspace, @actorProp) ->

		super

		@id = @actorProp.id

		@_expanded = yes

	isExpanded: ->

		@_expanded

	expand: ->

		return if @_expanded

		@_expanded = yes

		@_emit 'expand'

		return

	contract: ->

		return unless @_expanded

		@_expanded = no

		@_emit 'contract'

		return