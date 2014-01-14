ConnectionToClient = require './session/ConnectionToClient'

module.exports = class Session

	constructor: (@server, @id, socket) ->

		@dataHandler = @server.dataHandler

		@namespaceName = null

		@connection = new ConnectionToClient @, socket

		@connection.whenAskedFor 'head-json', @_sendHeadJson

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

			cb JSON.parse json

		return