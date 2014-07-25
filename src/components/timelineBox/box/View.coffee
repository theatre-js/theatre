El = require 'stupid-dom-interface'

module.exports = class TimelineBoxView

	constructor: (@box) ->

		@model = @box.model

		do @_prepareContainer

		@seekbar = new SeekbarView

	_prepareContainer: ->

		@containerNode = El '.theatrejs-timelineBox'
		.inside @box.theatre.containerNode

		@model.on 'dims-change', => @_updateDims

		do @_updateDims

	_updateDims: ->

		switch @model.dims.type

			when 'offset' then do @_updateDimsWithOffset

			else

				throw Error "Only 'offset' is supported for @model.dims.type"

	_updateDimsWithOffset: ->

		{dims} = @model

		@containerNode
		.css 'left', dims.left + 'px'
		.css 'right', dims.right + 'px'
		.css 'height', dims.height + 'px'
		.css 'bottom', dims.bottom + 'px'
