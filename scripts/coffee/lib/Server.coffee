ConnectionToClient = require './server/ConnectionToClient'
DataHandler = require './server/DataHandler'
array = require 'utila/scripts/js/lib/array'
io = require 'socket.io'

module.exports = class Server

	constructor: (rootPath, timelinesDir, port, acceptablePasswords) ->

		@dataHandler = new DataHandler @, rootPath, timelinesDir

		@_setPort port

		@_setAcceptablePasswords acceptablePasswords

		do @_setupSocket

	_setPort: (@port) ->

		unless Number.isFinite(@port) and parseInt(@port) is parseFloat(@port)

			throw Error "We need a valid port"

		unless @port > 3000

			throw Error "Port must be an integer over 3000"

	_setAcceptablePasswords: (@acceptablePasswords) ->

		unless Array.isArray(@acceptablePasswords) and @acceptablePasswords.length > 0

			throw Error "acceptablePasswords must be an array of strings"

		for pass in @acceptablePasswords

			unless typeof pass is 'string' and pass.length > 0

				throw Error "Invalid password in acceptablePasswords: '#{pass}'"

		return

	_setupSocket: ->

		@_connections = []

		@_connectionCounter = 0

		@io = io.listen @port

		@io.set 'log level', 2

		@io.on 'connection', @_serveConnection

		console.log "listening to port #{@port}"

		return

	_serveConnection: (socket) =>

		@_connections.push new ConnectionToClient @, @_connectionCounter++, socket

	_removeConnection: (c) ->

		array.pluckOneItem @_connections, c