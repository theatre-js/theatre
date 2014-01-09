module.exports = class ControlsView

	constructor: (@editor) ->

		@model = @editor.model.timeControl

		@moosh = @editor.moosh

		@kilid = @editor.kilid

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

		@moosh.onClick(@playPauseNode)
		.onDone =>

			do @_togglePlayState

	_prepareFullscreenNode: ->

		@toggleFullScreenNode = document.createElement 'div'
		@toggleFullScreenNode.classList.add 'timeflow-controls-fullscreen'

		@node.appendChild @toggleFullScreenNode

		@moosh.onClick(@toggleFullScreenNode)
		.onDone =>

			console.log 'to be implemented'

	_prepareJumpToPrevMarkerNode: ->

		@jumpToPrevMarkerNode = document.createElement 'div'
		@jumpToPrevMarkerNode.classList.add 'timeflow-controls-jumpToPrevMarker'

		@node.appendChild @jumpToPrevMarkerNode

		@moosh.onClick(@jumpToPrevMarkerNode)
		.onDone =>

			do @model.jumpToPrevMarker

	_prepareJumpToNextMarkerNode: ->

		@jumpToNextMarkerNode = document.createElement 'div'
		@jumpToNextMarkerNode.classList.add 'timeflow-controls-jumpToNextMarker'

		@node.appendChild @jumpToNextMarkerNode

		@moosh.onClick(@jumpToNextMarkerNode)
		.onDone =>

			do @model.jumpToNextMarker

	_prepareKeyboard: ->

		@kilid.on 'space', =>

			do @_togglePlayState

		@kilid.on 'home', =>

			do @model.jumpToFocusBeginning

		@kilid.on 'ctrl+home', =>

			do @model.jumpToBeginning

		@kilid.on 'end', =>

			do @model.jumpToFocusEnd

		@kilid.on 'ctrl+end', =>

			do @model.jumpToEnd

		@kilid.on 'right', =>

			@model.seekBy 16

		@kilid.on 'left', =>

			@model.seekBy -16

		@kilid.on 'shift+right', =>

			@model.seekBy 48

		@kilid.on 'shift+left', =>

			@model.seekBy -48

		@kilid.on 'alt+right', =>

			@model.seekBy 8

		@kilid.on 'alt+left', =>

			@model.seekBy -8

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