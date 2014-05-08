wn = require 'when'
io = require 'socket.io/node_modules/socket.io-client'
timeout = require 'when/timeout'
_Emitter = require '../../_Emitter'

module.exports = class ConnectionToServer extends _Emitter

	constructor: (@communicator) ->

		super

		@clientId = -1

		@isAuthenticated = no

		@initiallyLoaded = no

		do @_setupSocket

	ensureAuthentication: ->

		deferred = wn.defer()

		if @isAuthenticated

			deferred.resolve()

			return deferred.promise

		resolved = no

		@on 'next-authentication', (didAuthenticate) ->

			return if resolved

			resolved = yes

			if didAuthenticate

				deferred.resolve()

			else

				deferred.reject()

		deferred.promise

	connect: ->

		@ensureAuthentication()

	_setupSocket: ->

		@_socket = io.connect(@communicator._server)

		@_socket.on 'server-asks:send-auth-data', @_sendAuthData

	_sendAuthData: (clientId) =>

		@clientId = parseInt clientId

		if @communicator.editor.debug

			console.log 'client id', @clientId

			console.log "authenticating with '#{@communicator._password}' in '#{@communicator._namespaceName}'"

		@_socket.emit 'client-asks:get-auth-data',

			namespace: @communicator._namespaceName

			password: @communicator._password

		, @_getAuthResult

	_getAuthResult: (data) =>

		if data is 'accepted'

			@isAuthenticated = yes

			console.log 'auth accepted' if @communicator.editor.debug

		else

			@isAuthenticated = no

			console.error 'auth failed: ', data

		@_emit 'authentication', @isAuthenticated

		@_emit 'next-authentication', @isAuthenticated

		@removeListeners 'next-authentication'

	request: (what, data) ->

		promise = @ensureAuthentication().then =>

			@_request what, data

		timeout 10000, promise
		.then (result) ->

			return result

		, (ret) ->

			console.error "Server is not responding"

			return ret

	_request: (what, data) ->

		deferred = wn.defer()

		@_socket.emit 'client-requests:' + what, data, (receivedData) ->

			deferred.resolve receivedData

		deferred.promise