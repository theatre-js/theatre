module.exports = class StructureView

	constructor: (@editor) ->

		@structureModel = @editor.editorModel.structure
		@workspacesModel = @editor.editorModel.workspaces

		@clicks = @editor.clicks

		do @_prepareNode

	_prepareNode: ->

		@node = document.createElement 'div'
		@node.classList.add 'timeflow-structure'
		@editor.node.appendChild @node

		return

	show: ->

		@node.classList.add 'visible'

		@clicks.onModalClosure @node, =>

			do @hide

		return

	hide: ->

		@node.classList.remove 'visible'

		return

	prepare: ->

		for name, category of @structureModel.categories then do (category) =>

			catEl = document.createElement 'div'
			catEl.classList.add 'timeflow-structure-category'

			@node.appendChild catEl

			catNameEl = document.createElement 'h3'
			catNameEl.classList.add 'timeflow-structure-category-name'

			catNameEl.innerHTML = category.name

			catEl.appendChild catNameEl

			actorListEl = document.createElement 'ul'
			actorListEl.classList.add 'timeflow-structure-category-actor-list'

			catEl.appendChild actorListEl

			for name, actor of category.actors then do (actor) =>

				actorEl = document.createElement 'li'
				actorEl.classList.add 'timeflow-structure-category-actor'

				actorLink = document.createElement 'a'
				actorLink.innerHTML = actor.name

				actorEl.appendChild actorLink

				actorListEl.appendChild actorEl

				propsListEl = document.createElement 'ul'
				propsListEl.classList.add 'timeflow-structure-category-actor-propsList'

				actorLink.appendChild propsListEl

				for name, prop of actor.props then do (prop) =>

					propEl = document.createElement 'li'
					propEl.innerHTML = prop.name

					propsListEl.appendChild propEl

					unless @workspacesModel.isPropListed prop

						propEl.classList.add 'available'

					@workspacesModel.onPropListingChange prop, (type) =>

						if type is 'add'

							propEl.classList.add 'available'

						else

							propEl.classList.remove 'available'

						return

					@clicks.onClick propEl, =>

						@workspacesModel.togglePropListing prop

						return

		return