module.exports = class SeekBarView

	constructor: (@timeline) ->

		@clicks = @timeline.editor.clicks

		do @_prepareNode

	_prepareNode: ->

		@node = document.createElement 'div'
		@node.classList.add 'timeflow-seekbar'

		@timeline.node.appendChild @node