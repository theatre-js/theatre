module.exports = class SeekbarView

	constructor: (@timeline) ->

		@clicks = @timeline.editor.clicks

		@model = @timeline.editor.model.timeline.seekbar

		@controlsModel = @timeline.editor.model.controls

		window.addEventListener 'resize', => do @_resetSpace

		do @_prepareNode

		do @_prepareSeeker

		do @_prepareZoom

		do @_resetSpace

	_prepareNode: ->

		@node = document.createElement 'div'
		@node.classList.add 'timeflow-seekbar'

		@timeline.node.appendChild @node

	_prepareSeeker: ->

		@seeker = document.createElement 'div'
		@seeker.classList.add 'timeflow-seekbar-seeker'

		@node.appendChild @seeker

		do @_updateSeeker

		@model.on 'time-change', => do @_updateSeeker

		lastDragX = 0

		wasPlaying = no

		@clicks.onDrag @seeker,

			start: =>

				wasPlaying = @controlsModel.isPlaying()

				@controlsModel.pause() if wasPlaying

			end: ->

				lastDragX = 0

				if wasPlaying then @controlsModel.play()

			drag: (absX) =>

				relX = absX - lastDragX

				lastDragX = absX

				@_moveSeekerRelatively relX

	_moveSeekerRelatively: (x) ->

		toPos = @_getSeekerPos() + x

		console.log toPos

		t = @_seekerPosToTime toPos

		@model.tick t

	_getSeekerPos: ->

		t = @model.t

		zoom = @model.getZoomArea()

		rel = (t - zoom.position) / (zoom.duration / @model.timelineLength)

		@_space * rel

	_seekerPosToTime: (pos) ->

		tMinusPos = (pos / @_space) * (@model.getZoomArea().duration / @model.timelineLength)

		tMinusPos + @model.getZoomArea().position

	_repositionSeeker: ->

		curSeekerPos = @_getSeekerPos()

		@seeker.style.left = curSeekerPos + 'px'

		return

	_updateSeeker: ->

		zoom = @model.getZoomArea()

		t = @model.t

		# readjust the zoom area
		if t < zoom.position or t > zoom.position + zoom.duration

			@model.changeZoomArea t - (zoom.duration / 2), zoom.duration

		else

			do @_repositionSeeker

		return

	_prepareZoom: ->

		@model.on 'zoom-change', => do @_updateZoom

	_resetSpace: ->

		@_space = window.innerWidth

		do @_repositionElements

	_repositionElements: ->

		do @_repositionSeeker