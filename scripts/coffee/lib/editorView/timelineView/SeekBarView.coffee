module.exports = class SeekbarView

	constructor: (@timeline) ->

		@clicks = @timeline.editor.clicks

		@model = @timeline.editor.model.timeline.seekbar

		do @_prepareNode

	_prepareNode: ->

		@node = document.createElement 'div'
		@node.classList.add 'timeflow-seekbar'

		@timeline.node.appendChild @node