module.exports = class ConnectionToClient

	constructor: (@session, @socket) ->

		@id = @session.id

		@_isAuthenticated = no

		@_askListeners = {}

		console.log "connection: #{@id}"

		$emit = @socket.$emit

		socket.$emit = (msg, data, cb) =>

			if msg.substr(0, 15) is 'client-asks-for'

				@_receiveRequest msg, data, cb

				return

			$emit.apply socket, arguments

		# get redy for disconnect
		@socket.on 'disconnect', @_handleDisconnect

		@socket.emit '-server-asks:send-auth-data', @id

		@socket.on '-client-asks:get-auth-data', @_getAuthData

	_handleDisconnect: =>

		console.log "disconnected: #{@id}"

		do @session._disconnect

	_getAuthData: (data, cb) =>

		console.log 'got asked for auth'

		{password, namespace} = data

		unless @session._validateNamespace namespace

			console.log 'invalid namespace:', namespace

			return cb 'invalid-namespace'

		console.log 'setting namespace to', namespace

		unless @session._validatePasswordForNamespace namespace, password

			console.log 'invalid password:', password

			return cb 'invalid-password'

		console.log 'authenticated with:', password

		cb 'accepted'

		@session._setNamespace namespace

		@_isAuthenticated = yes

	_receiveRequest: (msg, data, cb) =>

		what = msg.substr 16, msg.length

		console.log 'got asked for', what

		unless @_isAuthenticated

			console.log 'not authenticated yet'

			return cb 'error:auth-required'

		listener = @_askListeners[what]

		unless listener?

			throw Error "No ask listener was found for '#{what}'"

		listener data, cb, what

	whenAskedFor: (what, cb) ->

		if @_askListeners[what]?

			throw Error "msg '#{what}' already has a listener attached"

		@_askListeners[what] = cb

		@