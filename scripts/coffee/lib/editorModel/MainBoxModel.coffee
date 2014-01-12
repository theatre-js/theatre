_Emitter = require '../_Emitter'

module.exports = class MainBoxModel extends _Emitter

	constructor: (@editor) ->

		@height = 400

		super

	isVisible: -> yes

	serialize: ->

		se = height: @height

		se

	setHeight: (newH) ->

		@height = newH

		@_emit 'height-change'

		return