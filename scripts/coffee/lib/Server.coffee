ConnectionToClient = require './server/ConnectionToClient'
sysPath = require 'path'
array = require 'utila/scripts/js/lib/array'
git = require 'gift'
io = require 'socket.io'
fs = require 'graceful-fs'

module.exports = class Server

	constructor: (rootPath, timelinesDir, port, acceptablePasswords) ->

		@_setPaths rootPath, timelinesDir

		@_setPort port

		@_setAcceptablePasswords acceptablePasswords

		do @_setupGit

		do @_setupSocket

	_setPaths: (@rootPath, @timelinesDir) ->

		@gitPath = sysPath.join @rootPath, '.git'

		unless fs.existsSync @gitPath

			throw Error "Git repo path '#{@gitPath}' doesn't exist"

		unless String(@timelinesDir).length > 0

			throw Error "@timelinesDir '#{@timelinesDir}' is not valid"

		@timelinesPath = sysPath.join @rootPath, @timelinesDir

		unless fs.existsSync @timelinesPath

			throw Error "Timelines path '#{@timelinesPath}' doesn't exist"

		namespaces = fs.readdirSync @timelinesPath

		@namespaces = []

		unless Array.isArray(namespaces) and namespaces.length > 0

			throw Error "no namespace found"

		for namespace in namespaces

			unless namespace.match /^[a-zA-Z0-9\-\_]+\.json$/

				throw Error "Invalid namespace json file: #{namespace}"

			@namespaces.push namespace.substr(0, namespace.length - 5)

		return

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

	_setupGit: ->

		@repo = git @rootPath

		# repo.add '.', ->

		# 	console.log 'added'

		# repo.commit 'second', (err) ->

		# 	console.log 'commited', err

		# repo.create_tag 'second', ->

		# 	# console.log arguments

		# repo.tags (err, tags) ->

		# 	console.log tags

		# repo.checkout 'first', ->

		# 	console.log arguments

		# repo.status ->

		# 	console.log arguments

	_setupSocket: ->

		@_connections = []

		@_connectionCounter = 0

		@io = io.listen @port

		@io.on 'connection', @_serveConnection

		console.log "listening to port #{@port}"

		return

	_serveConnection: (socket) =>

		@_connections.push new ConnectionToClient @, @_connectionCounter++, socket

	_removeConnection: (c) ->

		array.pluckOneItem @_connections, c