module.exports = class StructureView

	constructor: (@editorView) ->

		@structureModel = @editorView.editorModel.structure

		@node = document.createElement 'div'
		@node.classList.add 'timeflow-structure'
		@editorView.node.appendChild @node

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

			for name, actor of category.actors then do (actor) ->

				actorEl = document.createElement 'li'
				actorEl.classList.add 'timeflow-structure-category-actor'

				actorEl.innerHTML = actor.name

				actorListEl.appendChild actorEl


		return