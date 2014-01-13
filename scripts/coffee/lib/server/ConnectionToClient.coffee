module.exports = class ConnectionToClient

	constructor: (@server, @id, @socket) ->

		console.log "connection: #{@id}"

		# get redy for disconnect
		@socket.on 'disconnect', @_handleDisconnect

		# let's send client id
		@socket.emit 'set-client-id', @id

		@socket.on 'authenticate', @_authenticate

		do @_askAuthentication

	_handleDisconnect: =>

		console.log "disconnected: #{@id}"

		@server._removeConnection @

	_askAuthentication: ->

		console.log 'asking for auth'

		@_isAuthenticated = no

		@socket.emit 'authenticate'

	_authenticate: (data) =>

		console.log 'tryed to authenticate with', data

		@_isAuthenticated = data in @server.acceptablePasswords

		@socket.emit 'authentication-result', @_isAuthenticated

