io = require 'socket.io/node_modules/socket.io-client'
_Emitter = require '../../_Emitter'
wn = require 'when'

window.wn = wn

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

		console.log 'client id', @clientId

		console.log "authenticating with '#{@communicator._password}' in '#{@communicator._namespaceName}'"

		@_socket.emit 'client-asks:get-auth-data',

			namespace: @communicator._namespaceName

			password: @communicator._password

		, @_getAuthResult

	_getAuthResult: (data) =>

		if data is 'accepted'

			@isAuthenticated = yes

			console.log 'auth accepted'

		else

			@isAuthenticated = no

			console.error 'auth failed: ', data

		@_emit 'authentication', @isAuthenticated

		@_emit 'next-authentication', @isAuthenticated

		@removeListeners 'next-authentication'

	request: (what, data) ->

		@ensureAuthentication().then =>

			@_request what, data

	_request: (what, data) ->

		deferred = wn.defer()

		@_socket.emit 'client-requests:' + what, data, (receivedData) ->

			deferred.resolve receivedData

		deferred.promise