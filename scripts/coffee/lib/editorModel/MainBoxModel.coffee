_Emitter = require '../_Emitter'

module.exports = class MainBoxModel extends _Emitter

	constructor: (@editor) ->

		@height = 400

		super

	isVisible: -> yes

	serialize: ->

		se = height: @height

		se

	loadFrom: (se) ->

		@setHeight se.height

		return

	setHeight: (newH) ->

		return if @height is newH

		@height = newH

		@_emit 'height-change'

		return