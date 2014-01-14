_DynamicModel = require '../_DynamicModel'

module.exports = class MainBoxModel extends _DynamicModel

	constructor: (@editor) ->

		super

		@_serializedAddress = 'mainBox'

		@rootModel = @editor

		@height = 400

	isVisible: -> yes

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

		do @_reportLocalChange

		return