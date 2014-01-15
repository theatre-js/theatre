_DynamicModel = require '../_DynamicModel'

module.exports = class MainBoxModel extends _DynamicModel

	constructor: (@editor) ->

		super

		@_serializedAddress = 'mainBox'

		@rootModel = @editor

		@height = 400

		@_isVisible = yes

	isVisible: -> @_isVisible

	toggleVisibility: ->

		@_isVisible = not @_isVisible

		@_emit 'visibility-toggle'

		return

	serialize: ->

		se = height: @height

		se

	_loadFrom: (se) ->

		@setHeight se.height

		return

	setHeight: (newH) ->

		return if @height is newH

		@height = newH

		@_emit 'height-change'

		@_emit 'position-change'

		do @_reportLocalChange

		return

	toggleFullscreen: ->

