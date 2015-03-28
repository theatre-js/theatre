AttachmentClassDescriptor = require './attachmentClassesHolder/AttachmentClassDescriptor'

module.exports = class AttachmentClassesHolder
	constructor: (@_dee) ->
		@_descs = {}
		@_attachmentsByTarget = {}

	register: (id, cls) ->
		@_descs[id] = descriptor = new AttachmentClassDescriptor id, cls

		unless cls.target?
			throw Error "Attachment component '#{id}' doesn't have a target"

		for targetID in descriptor.getTargets()
			attachmentsAlreadyAttached = @_attachmentsByTarget[cls.target]

			unless attachmentsAlreadyAttached?
				@_attachmentsByTarget[targetID] = attachmentsAlreadyAttached = {}

			attachmentsAlreadyAttached[id] = descriptor

		return

	resolveAttachments: (targetDesc, targetObject, resolvedDeps) ->
		attachmentDescs = @_attachmentsByTarget[targetDesc.id]
		return unless attachmentDescs?

		listOfAttachmentIds = for id of attachmentDescs then id
		deferredAttachmentIds = []
		instantiatedAttachmentes = []

		loop
			break if listOfAttachmentIds.length is 0

			attachmentId = listOfAttachmentIds.shift()
			attachmentDesc = attachmentDescs[attachmentId]

			if attachmentDesc.hasPeerDeps()
				shouldDefer = no
				for depName, peerAttachmentId of attachmentDesc.getPeerDeps()
					continue if instantiatedAttachmentes[peerAttachmentId]?

					unless peerAttachmentId in listOfAttachmentIds
						throw Error "Attachment component '#{attachmentDesc.id}' needs to be peered with non-existing attachment component '#{peerAttachmentId}'"

					shouldDefer = yes

					break

				if shouldDefer
					if attachmentId in deferredAttachmentIds
						throw Error "Looks like there is a circular dependency involving '#{attachmentId}'"

					listOfAttachmentIds.push attachmentId
					deferredAttachmentIds.push attachmentId

					continue

			additionalProps = {}

			if attachmentDesc.hasPeerDeps()
				for depName, peerAttachmentId of attachmentDesc.getPeerDeps()
					additionalProps[depName] = instantiatedAttachmentes[peerAttachmentId]

			attachmentObj = @_instantiate attachmentId, targetDesc, targetObject, resolvedDeps, additionalProps
			instantiatedAttachmentes[attachmentId] = attachmentObj

		return

	_instantiate: (id, targetDesc, targetObject, resolvedDeps, additionalProps) ->
		descriptor = @_descs[id]
		@_dee._instantiateLocalOrAttachment descriptor, resolvedDeps, [targetObject], additionalProps