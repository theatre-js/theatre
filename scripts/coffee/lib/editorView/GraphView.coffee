module.exports = class GraphView

	constructor: (@editor) ->

		@rootView = @editor

		@graphModel = @editor.model.graph
		@workspacesModel = @editor.model.workspaces

		@rootView.moosh = @editor.moosh

		do @_prepareNode

	_prepareNode: ->

		@node = document.createElement 'div'
		@node.classList.add 'timeflow-graph'
		@editor.node.appendChild @node

		return

	show: ->

		@node.classList.add 'visible'

		@rootView.moosh.onClickOutside @node, =>

			do @hide

		return

	hide: ->

		@node.classList.remove 'visible'

		return

	prepare: ->

		n = -1

		for name, category of @graphModel.categories then do (category) =>

			n++

			catEl = document.createElement 'div'
			catEl.classList.add 'timeflow-graph-category'


			@node.appendChild catEl

			catNameEl = document.createElement 'h3'
			catNameEl.classList.add 'timeflow-graph-category-name'
			catNameEl.classList.add 'opening-animation'
			catNameEl.classList.add "n-#{n}"

			catNameEl.innerHTML = category.name

			catEl.appendChild catNameEl

			actorListEl = document.createElement 'ul'
			actorListEl.classList.add 'timeflow-graph-category-actor-list'

			catEl.appendChild actorListEl

			for name, actor of category.actors then do (actor) =>

				n++

				actorEl = document.createElement 'li'
				actorEl.classList.add 'timeflow-graph-category-actor'



				actorLink = document.createElement 'a'
				actorLink.innerHTML = actor.name
				actorLink.classList.add 'opening-animation'
				actorLink.classList.add "n-#{n}"

				actorEl.appendChild actorLink

				actorListEl.appendChild actorEl

				propsListEl = document.createElement 'ul'
				propsListEl.classList.add 'timeflow-graph-category-actor-propsList'

				actorEl.appendChild propsListEl

				for name, prop of actor.props then do (prop) =>

					propEl = document.createElement 'li'
					propEl.innerHTML = prop.name

					propsListEl.appendChild propEl

					unless @workspacesModel.isPropListed prop

						propEl.classList.add 'available'

					@workspacesModel.onPropListingChange prop, (type) =>

						if type is 'add'

							propEl.classList.remove 'available'

						else

							propEl.classList.add 'available'

						return

					@rootView.moosh.onClick(propEl)
					.onDone =>

						@workspacesModel.togglePropListing prop

						return

		return