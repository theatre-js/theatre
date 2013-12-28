module.exports = class SeekbarView

	constructor: (@timeline) ->

		@clicks = @timeline.editor.clicks

		@model = @timeline.editor.model.timeControl

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

		do @_repositionSeeker

		@model.on 'time-change', => do @_repositionSeeker

		lastDragX = 0

		wasPlaying = no

		@clicks.onDrag @seeker,

			start: =>

				wasPlaying = @model.isPlaying()

				@model.pause() if wasPlaying

			end: ->

				lastDragX = 0

				if wasPlaying then @model.play()

			drag: (absX) =>

				# debugger

				relX = absX - lastDragX

				lastDragX = absX

				# debugger

				@_moveSeekerRelatively relX

		return

	_prepareZoom: ->

		@zoomLeftNode = document.createElement 'div'
		@zoomLeftNode.classList.add 'timeflow-seekbar-zoom-left'

		@node.appendChild @zoomLeftNode

		@model.on 'zoom-change', => do @_repositionZoom

	_resetSpace: ->

		@_space = window.innerWidth

		do @_repositionElements

	_repositionElements: ->

		do @_repositionSeeker

	_repositionSeeker: ->

		curSeekerPos = @_getSeekerPos()

		@seeker.style.left = curSeekerPos + 'px'

		return

	_getSeekerPos: ->

		t = @model.t

		zoom = @model.getZoomArea()

		rel = (t - zoom.position) / zoom.duration

		@_space * rel

	_moveSeekerRelatively: (x) ->

		toPos = @_getSeekerPos() + x

		t = @_seekerPosToTime toPos

		@model.tick t

	_seekerPosToTime: (pos) ->

		zoom = @model.getZoomArea()

		(pos / @_space * zoom.duration) + zoom.position

	_repositionZoom: ->

		zoom = @model.getZoomArea()

		left = (zoom.position / @_getTimelineLength()) * @_space

		@zoomLeftNode.style.left = left + 'px'

		right = ((zoom.position + zoom.duration) / @_getTimelineLength()) * @_space

		@zoomRightNode.style.left = right + 'px'

	_getTimelineLength: ->

		@model.timelineLength