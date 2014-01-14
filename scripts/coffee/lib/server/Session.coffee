ConnectionToClient = require './session/ConnectionToClient'

module.exports = class Session

	constructor: (@server, @id, socket) ->

		@dataHandler = @server.dataHandler

		@namespaceName = null

		@connection = new ConnectionToClient @, socket

		@connection.whenRequestedFor 'head-json', @_sendHeadJson

		@connection.whenRequestedFor 'replace-part-of-head', @_replacePartOfHead

	_disconnect: ->

		@server._removeSession @

	_validateNamespace: (namespace) ->

		@dataHandler.hasNamespace namespace

	_validatePasswordForNamespace: (namespace, password) ->

		password in @server.acceptablePasswords

	_setNamespace: (@namespaceName) ->

	_sendHeadJson: (received, cb) =>

		@dataHandler.getHeadJsonForNamespace(@namespaceName)
		.then (json) =>

			cb json

		return

	_replacePartOfHead: (parts, cb) =>

		console.log 'replacing head with', parts

		{address, newData} = parts

		@dataHandler.getHeadJsonForNamespace(@namespaceName)
		.then (json) =>

			obj = json

			cur = obj

			lastName = address.pop()

			for subName in address

				cur = cur[subName]

				unless cur?

					throw Error "Couldn't find subName '#{subName}' in json data"

			cur[lastName] = newData

			@dataHandler.replaceJsonForNamespace(@namespaceName, obj)

			cb 'done'