module.exports = class ConnectionToClient

	constructor: (@server, @id, @socket) ->

		@dataHandler = @server.dataHandler

		console.log "connection: #{@id}"

		# get redy for disconnect
		@socket.on 'disconnect', @_handleDisconnect

		# let's send client id
		@socket.emit 'set-client-id', @id

		@socket.on 'authenticate', @_authenticate

		@socket.on 'get-head', @_sendHeadJson

		do @_askAuthentication

		do @_askNamespace

	_handleDisconnect: =>

		console.log "disconnected: #{@id}"

		@server._removeConnection @

	_askAuthentication: ->

		console.log 'asking for auth'

		@_isAuthenticated = no

		@socket.emit 'authenticate'

	_authenticate: (data) =>

		console.log 'tried to authenticate with', data

		@_isAuthenticated = data in @server.acceptablePasswords

		@socket.emit 'receive-authentication-result', @_isAuthenticated

	_sendHeadJson: =>

		console.log 'sending head json'

		@dataHandler.getJsonForNamespace(@namespaceName)

		.then (json) =>

			@socket.emit 'receive-head', json

	_askNamespace: ->

		@namespaceName = null

		@socket.emit 'get-namespace'

		@socket.on 'set-namespace', @_setNamespace

	_setNamespace: (ns) =>

		console.log 'Setting namespace to', ns

		unless @dataHandler.hasNamespace ns

			console.log 'Invalid namespace: ', ns

			@socket.emit 'invalid-namespace'

		@namespaceName = ns