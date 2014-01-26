Prop = require './Prop'

module.exports = class PropOfArray extends Prop

	constructor: (timeline, id, @arrayName, @arrayIndex) ->

		super

		@array = @timeline._arrays[@arrayName]

		@initial = @get()

	_set: (val) ->

		@array[@arrayIndex] = val

		return

	get: ->

		@array[@arrayIndex]