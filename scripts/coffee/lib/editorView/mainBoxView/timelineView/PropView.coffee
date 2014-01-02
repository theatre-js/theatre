Foxie = require 'foxie'

module.exports = class PropView

	constructor: (@repo, @propModel) ->

		@timeline = @repo.timeline

		@id = @propModel.id

		@timeFlowProp = @propModel.timeFlowProp

		@pacs = @timeFlowProp.pacs

		@clicks = @repo.timeline.mainBox.editor.clicks

		@_expanded = no

		@_propHolderModel = null

		do @_prepareNodes

	_prepareNodes: ->

		@node = Foxie '.timeflow-timeline-prop'

		do @_prepareInfoNodes

		do @_preparePacsNode

	_prepareInfoNodes: ->

		@info = Foxie('.timeflow-timeline-prop-info').putIn @node

		@clicks.onClick @info, =>

			@_setExpansion @_propHolderModel.toggleExpansion()

		@catName = Foxie('.timeflow-timeline-prop-info-catName').putIn @info
		@catName.node.innerHTML = @propModel.actor.category.name

		@actorName = Foxie('.timeflow-timeline-prop-info-actorName').putIn @info
		@actorName.node.innerHTML = @propModel.actor.name

		@propName = Foxie('.timeflow-timeline-prop-info-propName').putIn @info
		@propName.node.innerHTML = @propModel.name

	_preparePacsNode: ->

		@pacsNode = Foxie('.timeflow-timeline-prop-pacs').putIn @node

	_setPropHolderModel: (@_propHolderModel) ->

		@_setExpansion @_propHolderModel.isExpanded()

	attach: ->

		@node.putIn @timeline.node

		return

	detach: ->

		@node.remove()

		return

	_setExpansion: (expanded) ->

		return if expanded is @_expanded

		@_expanded = expanded

		if @_expanded

			@node.addClass 'expanded'

		else

			@node.removeClass 'expanded'

		return