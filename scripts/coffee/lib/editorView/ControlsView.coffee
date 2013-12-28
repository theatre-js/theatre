module.exports = class ControlsView

	constructor: (@editor) ->

		@model = @editor.model.timeControl

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

		@keys.on 'home', null, =>

			do @model.jumpToBeginning

		@keys.on 'end', null, =>

			do @model.jumpToEnd

		@keys.on 'up', null, =>

			do @model.prevMarker

		@keys.on 'down', null, =>

			do @model.nextMarker

		@keys.on 'right', null, =>

			do @model.seekForward

		@keys.on 'left', null, =>

			do @model.seekBackward

	_togglePlayState: ->

		@model.togglePlayState()

	_updatePlayState: ->

		if @model.isPlaying()

			@playPauseNode.classList.add 'playing'

		else

			@playPauseNode.classList.remove 'playing'

		return