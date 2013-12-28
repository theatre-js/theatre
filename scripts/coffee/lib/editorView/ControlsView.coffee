module.exports = class ControlsView

	constructor: (@editor) ->

		@model = @editor.model.controls

		@clicks = @editor.clicks

		@keys = @editor.keys

		do @_prepareNodes

		do @_prepareKeyboard

		@model.on 'play-state-change', => do @_updatePlayState

		do @_updatePlayState

	_prepareNodes: ->

		@node = document.createElement 'div'
		@node.classList.add 'timeflow-controls'

		@editor.node.appendChild @node

		do @_preparePlayPayseNode

	_preparePlayPayseNode: ->

		@playPauseNode = document.createElement 'div'
		@playPauseNode.classList.add 'timeflow-controls-playPause'

		@node.appendChild @playPauseNode

		@clicks.onClick @playPauseNode, =>

			do @_togglePlayState

	_prepareKeyboard: ->

		@keys.on ' ', null, =>

			do @_togglePlayState

	_togglePlayState: ->

		@model.togglePlayState()

	_updatePlayState: ->

		if @model.isPlaying()

			@playPauseNode.classList.add 'playing'

		else

			@playPauseNode.classList.remove 'playing'

		return