_Dynamic = require '../_Dynamic'

module.exports = class MainBoxModel extends _Dynamic

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