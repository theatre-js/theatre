Foxie = require 'foxie'

module.exports = class GraphView

	constructor: (@editor) ->

		@rootView = @editor

		@graphModel = @editor.model.graph
		@workspacesModel = @editor.model.workspaces

		@rootView.moosh = @editor.moosh

		do @_prepareNode

	_prepareNode: ->

		@node = Foxie 'div.timeflow-graph'

		@node.putIn @editor.node

		return

	show: ->

		@node.addClass 'visible'

		@rootView.moosh.onClickOutside @node, =>

			do @hide

		return

	hide: ->

		@node.removeClass 'visible'

		return

	prepare: ->

		n = -1

		for name, category of @graphModel.categories then do (category) =>

			n++

			catEl = Foxie 'div.timeflow-graph-category'


			catEl.putIn @node

			catNameEl = Foxie "h3.timeflow-graph-category-name.opening-animation.n-#{n}"

			catNameEl.innerHTML category.name

			catNameEl.putIn catEl

			actorListEl = Foxie 'ul.timeflow-graph-category-actor-list'

			actorListEl.putIn catEl

			for name, actor of category.actors then do (actor) =>

				n++

				actorEl = Foxie 'li.timeflow-graph-category-actor'

				actorLink = Foxie "a.opening-animation.n-#{n}"
				actorLink.innerHTML actor.name

				actorLink.putIn actorEl

				actorEl.putIn actorListEl

				propsListEl = Foxie 'ul.timeflow-graph-category-actor-propsList'

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