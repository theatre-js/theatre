Prop = require './Prop'

module.exports = class PropOfArray extends Prop

	constructor: (timeline, id, @arrayName, @arrayIndex) ->

		super

		@array = @timeline._arrays[@arrayName]

		@initial = @array[@arrayIndex]

	_set: (val) ->

		@array[@arrayIndex] = val

		return