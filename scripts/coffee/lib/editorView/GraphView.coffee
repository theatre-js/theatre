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

		n = -1

		for name, group of @graphModel.categories then do (group) =>

			n++

			catEl = Foxie 'div.theatrejs-graph-group'


			catEl.putIn @node

			catNameEl = Foxie "h3.theatrejs-graph-group-name.opening-animation.n-#{n}"

			catNameEl.innerHTML group.name

			catNameEl.putIn catEl

			actorListEl = Foxie 'ul.theatrejs-graph-group-actor-list'

			actorListEl.putIn catEl

			for name, actor of group.actors then do (actor) =>

				n++

				actorEl = Foxie 'li.theatrejs-graph-group-actor'

				actorLink = Foxie "a.opening-animation.n-#{n}"
				actorLink.innerHTML actor.name

				actorLink.putIn actorEl

				actorEl.putIn actorListEl

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