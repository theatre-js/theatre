io = require 'socket.io/node_modules/socket.io-client'

module.exports = class ConnectionToServer

	constructor: (@communicator) ->

		@clientId = -1

		@isAuthenticated = no

		do @_setupSocket

	_setupSocket: ->

		@_socket = io.connect(@communicator._server)

		@_socket.on 'authenticate', @_authenticate

		@_socket.on 'authentication-result', @_authenticationResult

		@_socket.on 'set-client-id', @_setClientId

	_authenticate: =>

		console.log 'authenticating'

		@_socket.emit 'authenticate', @communicator._password

	_setClientId: (clientId) =>

		@clientId = parseInt clientId

		console.log 'client id', @clientId

	_authenticationResult: (data) ->

		@isAuthenticated = Boolean data

		if @isAuthenticated

			console.log 'Authenticated'

		else

			console.log 'Auth failed'