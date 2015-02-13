fs = require 'fs'
CSON = require 'cson'
{object} = require 'utila'
inquirer = require 'inquirer'
_ = require 'lodash'
wn = require 'when'
require('pretty-monitor').start()

module.exports = class LaneMerger

	constructor: (oursPath, theirsPath, mergedPath) ->

		@ours = @_getJson oursPath
		@theirs = @_getJson theirsPath

		@_mergeLanes @ours, @theirs
		.then (merged) ->

			cson = CSON.stringifySync merged

			fs.writeFileSync mergedPath, cson, {encoding: 'utf-8'}

	_getJson: (path) ->

		cson = fs.readFileSync path, {encoding: 'utf-8'}

		if (cson.replace /\s+/, '') is ''

			return {}

		obj = CSON.parseSync cson

		if obj instanceof Error

			console.log obj

			throw obj

		obj

	_mergeLanes: (ours, theirs) ->

		ret = {}

		d = wn.defer()

		@_mergeEasyParts ours, theirs, ret
		@_mergeTimelineEditor ours, theirs, ret
		@_mergeWorkspaces ours, theirs, ret

		@_mergeTimeline ours, theirs, ret
		.then ->

			d.resolve ret

		d.promise

	_mergeEasyParts: (ours, theirs, ret) ->

		ret.mainBox = object.append ours.mainBox or {}, theirs.mainBox
		ret.timeControl = object.append ours.timeControl or {}, theirs.timeControl

	_mergeTimelineEditor: (ours, theirs, ret) ->

		ret.timelineEditor = object.append ours.timelineEditor or {}, theirs.timelineEditor

		list = []

		if ours.timelineEditor.guides._list?

			for t in ours.timelineEditor.guides._list

				t = parseFloat t

				list.push t unless t in list

		if theirs.timelineEditor.guides._list?

			for t in theirs.timelineEditor.guides._list

				t = parseFloat t

				list.push t unless t in list

		list.sort (b, a) ->

			b - a

		ret.timelineEditor.guides._list = list

	_mergeWorkspaces: (ours, theirs, ret) ->

		ret.workspaces = object.append ours.workspaces or {}, theirs.workspaces

		list = object.clone ours.workspaces.workspaces

		return unless theirs.workspaces.workspaces?

		for ws in theirs.workspaces.workspaces

			@_appendWorkspace list, ws

		return

	_appendWorkspace: (list, ws) ->

		cur = @_getWorkspaceByName(list, ws.name)

		unless cur?

			list.push ws

			return

		@_mergeSingleWorkspaces cur, ws

	_getWorkspaceByName: (list, name) ->

		for ws in list

			return ws if ws.name is name

		return

	_mergeSingleWorkspaces: (cur, ws) ->

		for propHolder in ws.propHolders

			unless @_workspaceHasPropHolder cur, propHolder

				cur.propHolders.push propHolder

		return

	_workspaceHasPropHolder: (ws, propHolder) ->

		for ph in ws.propHolders

			return yes if ph.id is propHolder.id

		no

	_mergeTimeline: (ours, theirs, ret) ->

		lastPromise = wn()

		ret.timeline = object.clone ours.timeline

		props = ret.timeline._allProps

		for id, prop of theirs.timeline._allProps

			unless props[id]?

				props[id] = prop

				continue

			do (id, props, prop) =>

				lastPromise = lastPromise.then =>

					@_mergeProps props[id], prop, id, props

		lastPromise

	_mergeProps: (ours, theirs, id, props) ->

		return if _.isEqual(ours, theirs)

		console.log "\n"
		console.log "Conflict in #{id}"
		console.log "  Ours:   #{ours.pacs.chronology.points.length} points and #{ours.pacs.chronology.connectors.length} connectors"
		console.log "  Theirs: #{theirs.pacs.chronology.points.length} points and #{theirs.pacs.chronology.connectors.length} connectors"

		@_ask 'Which?', ['Keep ours', 'Keep theirs']
		.then (choice) ->

			return if choice is 'Keep ours'

			if choice is 'Keep theirs'

				props[id] = theirs

			return

	_ask: (msg, choices, cb) ->

		d = wn.defer()

		a =

			type: "list"
			name: "name"
			message: msg
			choices: choices

		inquirer.prompt [a], (choice) ->

			d.resolve choice.name

			return

		d.promise