PipingEmitter = require 'utila/lib/PipingEmitter'
El = require 'stupid-dom-interface'

module.exports = class View

	constructor: (@editor) ->

		@events = new PipingEmitter

		@model = @editor.model

		do @_prepareContainer

	_prepareContainer: ->

		@containerNode = El '.theatrejs-timelineEditor'
		.inside @editor.theatre.containerNode

		@model.events.on 'dims-change', => @_updateDims

		window.addEventListener 'resize', => do @_updateDims

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

		@width = window.innerWidth - dims.left - dims.right
		@height = dims.height

		@events._emit 'dims-change'