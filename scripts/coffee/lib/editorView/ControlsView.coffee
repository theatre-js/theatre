module.exports = class ControlsView

	constructor: (@editor) ->

		@rootView = @editor

		@model = @editor.model.timeControl

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

		@rootView.moosh.onClick(@playPauseNode)
		.onDone =>

			do @_togglePlayState

	_prepareFullscreenNode: ->

		@toggleFullScreenNode = document.createElement 'div'
		@toggleFullScreenNode.classList.add 'timeflow-controls-fullscreen'

		@node.appendChild @toggleFullScreenNode

		@rootView.moosh.onClick(@toggleFullScreenNode)
		.onDone =>

			console.log 'to be implemented'

	_prepareJumpToPrevMarkerNode: ->

		@jumpToPrevMarkerNode = document.createElement 'div'
		@jumpToPrevMarkerNode.classList.add 'timeflow-controls-jumpToPrevMarker'

		@node.appendChild @jumpToPrevMarkerNode

		@rootView.moosh.onClick(@jumpToPrevMarkerNode)
		.onDone =>

			do @model.jumpToPrevMarker

	_prepareJumpToNextMarkerNode: ->

		@jumpToNextMarkerNode = document.createElement 'div'
		@jumpToNextMarkerNode.classList.add 'timeflow-controls-jumpToNextMarker'

		@node.appendChild @jumpToNextMarkerNode

		@rootView.moosh.onClick(@jumpToNextMarkerNode)
		.onDone =>

			do @model.jumpToNextMarker

	_prepareKeyboard: ->

		@rootView.kilid.on 'space', =>

			do @_togglePlayState

		@rootView.kilid.on 'home', =>

			do @model.jumpToFocusBeginning

		@rootView.kilid.on 'ctrl+home', =>

			do @model.jumpToBeginning

		@rootView.kilid.on 'end', =>

			do @model.jumpToFocusEnd

		@rootView.kilid.on 'ctrl+end', =>

			do @model.jumpToEnd

		@rootView.kilid.on 'right', =>

			@model.seekBy 16

		@rootView.kilid.on 'left', =>

			@model.seekBy -16

		@rootView.kilid.on 'shift+right', =>

			@model.seekBy 48

		@rootView.kilid.on 'shift+left', =>

			@model.seekBy -48

		@rootView.kilid.on 'alt+right', =>

			@model.seekBy 8

		@rootView.kilid.on 'alt+left', =>

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