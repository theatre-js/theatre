Foxie = require 'foxie'

module.exports = class GraphView

	constructor: (@editor) ->

		@rootView = @editor

		@graphModel = @editor.model.graph
		@workspacesModel = @editor.model.workspaces

		@rootView.moosh = @editor.moosh

		@_showHideTimeout = null

		do @_prepareNode

	_prepareNode: ->

		@node = Foxie 'div.theatrejs-graph'

		return

	show: ->

		if @_showHideTimeout?

			clearTimeout @_showHideTimeout

			@_showHideTimeout = null

		@node.putIn @editor.node

		@node.addClass 'visible'

		@rootView.moosh.onClickOutside @node, =>

			do @hide

		return

	hide: ->

		@node.removeClass 'visible'

		@_showHideTimeout = setTimeout =>

			@node.remove()

			@_showHideTimeout = null

		, 500

		return

	prepare: ->

		for name, group of @graphModel.categories then do (group) =>

			catNameEl = Foxie "h3.theatrejs-graph-group-name"

			catNameEl.innerHTML group.name

			catNameEl.putIn @node

			actorsCount = Object.keys(group.actors).length

			i = -1

			for name, actor of group.actors then do (actor) =>

				i++

				last = i is actorsCount - 1

				actorEl = Foxie '.theatrejs-graph-group-actor'
				actorEl.addClass 'last' if last

				actorLink = Foxie 'a'
				actorLink.innerHTML actor.name

				actorLink.putIn actorEl

				actorEl.putIn @node

				propsListEl = Foxie 'ul.theatrejs-graph-group-actor-propsList'

				propsListEl.putIn actorEl

				for name, prop of actor.props then do (prop) =>

					propEl = Foxie 'li'
					propEl.innerHTML prop.name

					propEl.putIn propsListEl

					unless @workspacesModel.isPropListed prop

						propEl.addClass 'available'

					@workspacesModel.onPropListingChange prop, (type) =>

						if type is 'add'

							propEl.removeClass 'available'

						else

							propEl.addClass 'available'

						return

					@rootView.moosh.onClick(propEl)
					.onDone =>

						@workspacesModel.togglePropListing prop

						return

		return