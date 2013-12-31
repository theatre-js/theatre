Foxie = require 'foxie'

module.exports = class PropView

	constructor: (@repo, @propModel) ->

		@timeline = @repo.timeline

		@id = @propModel.id

		@_propHolderModel = null

		do @_prepareNode

	_prepareNode: ->

		@node = Foxie '.timeflow-timeline-prop'

		@info = Foxie('.timeflow-timeline-prop-info').putIn @node

		@catName = Foxie('.timeflow-timeline-prop-info-catName').putIn @info
		@catName.node.innerHTML = @propModel.actor.category.name

		@actorName = Foxie('.timeflow-timeline-prop-info-actorName').putIn @info
		@actorName.node.innerHTML = @propModel.actor.name

		@propName = Foxie('.timeflow-timeline-prop-info-propName').putIn @info
		@propName.node.innerHTML = @propModel.name

	_setPropHolderModel: (@_propHolderModel) ->

	attach: ->

		@node.putIn @timeline.node

		return

	detach: ->

		@node.remove()

		return