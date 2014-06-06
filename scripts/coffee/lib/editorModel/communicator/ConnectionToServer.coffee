wn = require 'when'
io = require 'socket.io/node_modules/socket.io-client'
timeout = require 'when/timeout'
_Emitter = require '../../_Emitter'

module.exports = class ConnectionToServer extends _Emitter

	constructor: (@communicator) ->

		super

		do @_setupSocket

	connect: ->

		@_connectionPromise

	_setupSocket: ->

		d = wn.defer()

		@_connectionPromise = d.promise

		@_socket = io.connect @communicator._server

		@_socket.on 'connect', -> d.resolve()

		@_socket.on 'error', (data) ->

			console.log 'socket error', data

		@_socket.on 'connection_failed', (data) ->

			console.log 'socket connection failed', data

	request: (what, data) ->

		promise = @connect().then =>

			@_request what, data

		promise

	_request: (what, data) ->

		d = wn.defer()

		data =

			croods:

				namespace: @communicator._namespaceName

				passphrase: @communicator._passphrase

			data: data

		@_socket.emit 'client-requests:' + what, data, (receivedData) ->

			d.resolve receivedData

		d.promise