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

		do @_prepareFullscreenNode
		do @_prepareJumpToPrevMarkerNode
		do @_preparePlayPauseNode
		do @_prepareJumpToNextMarkerNode


	_preparePlayPauseNode: ->

		@playPauseNode = document.createElement 'div'
		@playPauseNode.classList.add 'timeflow-controls-playPause'

		@node.appendChild @playPauseNode

		@clicks.onClick @playPauseNode, =>

			do @_togglePlayState

	_prepareFullscreenNode: ->

		@toggleFullScreenNode = document.createElement 'div'
		@toggleFullScreenNode.classList.add 'timeflow-controls-fullscreen'

		@node.appendChild @toggleFullScreenNode

		@clicks.onClick @toggleFullScreenNode, =>

			console.log 'to be implemented'

	_prepareJumpToPrevMarkerNode: ->

		@jumpToPrevMarkerNode = document.createElement 'div'
		@jumpToPrevMarkerNode.classList.add 'timeflow-controls-jumpToPrevMarker'

		@node.appendChild @jumpToPrevMarkerNode

		@clicks.onClick @jumpToPrevMarkerNode, =>

			do @model.jumpToPrevMarker

	_prepareJumpToNextMarkerNode: ->

		@jumpToNextMarkerNode = document.createElement 'div'
		@jumpToNextMarkerNode.classList.add 'timeflow-controls-jumpToNextMarker'

		@node.appendChild @jumpToNextMarkerNode

		@clicks.onClick @jumpToNextMarkerNode, =>

			do @model.jumpToNextMarker

	_prepareKeyboard: ->

		@keys.setScope 'time'

		@keys 'space', 'time', (e, h) =>

			do @_togglePlayState

		@keys 'home, ctrl+home', 'time', (e, h) =>

			if e.ctrlKey

				do @model.jumpToBeginning

			else

				do @model.jumpToFocusBeginning

		@keys 'end, ctrl+end', 'time', (e, h) =>

			if e.ctrlKey

				do @model.jumpToEnd

			else

				do @model.jumpToFocusEnd

		@keys 'up', 'time', (e, h) =>

			do @model.prevMarker

		@keys 'down', 'time', (e, h) =>

			do @model.nextMarker

		@keys 'right, shift+right, alt+right', 'time', (e, h) =>

			amount = @_getSeekAmountByEvent e

			@model.seekBy amount

		@keys 'left, shift+left, alt+left', 'time', (e, h) =>

			amount = @_getSeekAmountByEvent e

			@model.seekBy -amount

	_getSeekAmountByEvent: (e) ->

		amount = 16

		if e.shiftKey

			amount = 48

		if e.altKey

			amount = 8

		amount

	_togglePlayState: ->

		@model.togglePlayState()

	_updatePlayState: ->

		if @model.isPlaying()

			@playPauseNode.classList.add 'playing'

		else

			@playPauseNode.classList.remove 'playing'

		return