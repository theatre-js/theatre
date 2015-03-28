ClassDescriptor = require '../ClassDescriptor'

module.exports = class GlobalClassDescriptor extends ClassDescriptor
	isLazy: ->
		@cls.lazy is true