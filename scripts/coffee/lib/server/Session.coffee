ConnectionToClient = require './session/ConnectionToClient'

module.exports = class Session

	constructor: (@server, @id, socket) ->

		@dataHandler = @server.dataHandler

		@namespaceName = null

		@connection = new ConnectionToClient @, socket

		@connection.whenRequestedFor 'head-data', @_sendHeadData

		@connection.whenRequestedFor 'replace-part-of-head', @_replacePartOfHead

	_disconnect: ->

		@server._removeSession @

	_validateNamespace: (namespace) ->

		@dataHandler.hasNamespace namespace

	_validatePasswordForNamespace: (namespace, password) ->

		password in @server.acceptablePasswords

	_setNamespace: (@namespaceName) ->

	_sendHeadData: (received, cb) =>

		@dataHandler.getHeadDataForNamespace(@namespaceName)
		.then (data) =>

			cb data

		return

	_replacePartOfHead: (parts, cb) =>

		{address, newData} = parts

		@dataHandler.getHeadDataForNamespace(@namespaceName)
		.then (obj) =>

			cur = obj

			lastName = address.pop()

			for subName in address

				if cur[subName]?

					cur = cur[subName]

				else

					cur[subName] = cur = {}

					console.log "Couldn't find subName '#{subName}' in cson data"

			cur[lastName] = newData

			@dataHandler.replaceHeadDataForNamespace(@namespaceName, obj)

			cb 'done'