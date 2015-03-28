ClassDescriptor = require '../ClassDescriptor'

module.exports = class AttachmentClassDescriptor extends ClassDescriptor
	getTargets: ->
		if @cls.targets?
			unless Array.isArray @cls.targets
				throw Error "The `targets` attribute on '#{@id}' must be an array."

			return @cls.targets

		unless @cls.target?
			throw Error "Attachment component '#{@id}' doesn't have any targets"

		[@cls.target]

	hasPeerDeps: ->
		@getPeerDeps()?

	getPeerDeps: ->
		@cls.peerDeps