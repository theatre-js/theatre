Foxie = require 'foxie'

module.exports = class ControlsView

	constructor: (@editor) ->

		@rootView = @editor

		@model = @editor.model.timeControl

		do @_prepareNodes

		do @_prepareKeyboard

		@model.on 'play-state-change', => do @_updatePlayState

		@mainBox = @editor.model.mainBox

		@_curY = 0

		do @_updatePosition

		@mainBox.on 'height-change', => do @_updatePosition

		do @_updatePlayState

	_prepareNodes: ->

		@node = Foxie('.timeflow-controls').trans(500)

		@node.putIn @editor.node

		do @_prepareFullscreenNode
		do @_prepareJumpToPrevMarkerNode
		do @_preparePlayPauseNode
		do @_prepareJumpToNextMarkerNode

	_preparePlayPauseNode: ->

		@playPauseNode = Foxie '.timeflow-controls-playPause'

		@playPauseNode.putIn @node

		@rootView.moosh.onClick(@playPauseNode)
		.onDone =>

			do @_togglePlayState

	_prepareFullscreenNode: ->

		@toggleFullScreenNode = Foxie '.timeflow-controls-fullscreen'

		@toggleFullScreenNode.putIn @node

		@rootView.moosh.onClick(@toggleFullScreenNode)
		.onDone =>

			console.log 'to be implemented'

	_prepareJumpToPrevMarkerNode: ->

		@jumpToPrevMarkerNode = Foxie '.timeflow-controls-jumpToPrevMarker'

		@jumpToPrevMarkerNode.putIn @node

		@rootView.moosh.onClick(@jumpToPrevMarkerNode)
		.onDone =>

			do @model.jumpToPrevMarker

	_prepareJumpToNextMarkerNode: ->

		@jumpToNextMarkerNode = Foxie '.timeflow-controls-jumpToNextMarker'

		@jumpToNextMarkerNode.putIn @node

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

	_updatePosition: ->

		newY = -@mainBox.height - 8

		return if newY is @_curY

		@_curY = newY

		@node.moveYTo(@_curY)

		return

	_togglePlayState: ->

		@model.togglePlayState()

	_updatePlayState: ->

		if @model.isPlaying()

			@playPauseNode.addClass 'playing'

		else

			@playPauseNode.removeClass 'playing'

		return