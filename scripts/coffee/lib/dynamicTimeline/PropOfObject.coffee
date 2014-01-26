Prop = require './Prop'

module.exports = class PropOfObject extends Prop

	constructor: (timeline, id, @objectName, @_objectSetterName, @_objectGetterName) ->

		super

		@object = @timeline._objects[@objectName]

		@initial = @get()

	_set: (val) ->

		@object[@_objectSetterName] val

		return

	get: ->

		@object[@_objectGetterName]()