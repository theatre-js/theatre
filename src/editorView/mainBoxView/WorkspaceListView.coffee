Foxie = require 'foxie'
_Emitter = require '../../_Emitter'

module.exports = class WorkspaceListView extends _Emitter
  constructor: (@mainBox) ->
    super

    @rootView = @mainBox.rootView
    @rootView.kilidScopeForEdit = @rootView.kilid.getScope 'workspace-list-view'

    @node = Foxie('.theatrejs-workspaceList').putIn(@mainBox.node)
    @holder = Foxie('.theatrejs-workspaceList-holder').putIn(@node)
    @model = @mainBox.editor.model.workspaces
    @model.on 'new-workspace', (ws) =>
      @_recognizeNewWorkspace ws

    do @_initRename
    do @_initNewBtn

  _recognizeNewWorkspace: (ws) ->
    wsNode = new Foxie('.theatrejs-workspaceList-workspace').putIn(@holder)
    wsNode.node.innerHTML = ws.name
    @_attachCtrl wsNode.node

    ws.on 'remove', =>
      wsNode.remove()

    @rootView.moosh.onClick(wsNode)
    .withNoKeys()
    .onDone (e) =>
      ws.activate()

    @rootView.moosh.onClick(wsNode)
    .withKeys('super')
    .onDone (e) =>
      @rootView.moosh.ignore(wsNode)
      @_startEdit wsNode, =>
        @rootView.moosh.unignore(wsNode)
        if wsNode.node.innerHTML.trim() is ''
          ws.remove()
        else
          ws.rename wsNode.node.innerHTML.trim()

      , =>
        @rootView.moosh.unignore(wsNode)
        wsNode.node.innerHTML = ws.name

  _attachCtrl: (node) ->
    @rootView.moosh.onHover(node)
    .withKeys('super')
    .onEnter =>
      node.classList.add 'pre-edit'

    .onLeave =>
      node.classList.remove 'pre-edit'

    return

  _initRename: ->
    @currentEdit = null

    @rootView.kilidScopeForEdit.on('enter')
    .onEnd (e) =>
      @_storeEdit()

    @rootView.kilidScopeForEdit.on('esc')
    .onEnd (e) =>
      @_discardEdit()

    @rootView.kilidScopeForEdit.on('super+delete')
    .onEnd (e) =>
      @currentEdit.innerHTML = ''
      @_storeEdit()

  _startEdit: (wsNode, cb, discard) ->
    @rootView.kilidScopeForEdit.activate()

    @currentEditCallBack = cb
    @currentEditDiscardCallBack = discard

    @currentEdit = wsNode.node
    @currentText = @currentEdit.innerHTML
    @currentEdit.contentEditable = yes
    @currentEdit.classList.add 'editing'
    @currentEdit.focus()

  _storeEdit: ->
    return unless @currentEdit?

    @rootView.kilidScopeForEdit.deactivate()
    @currentEdit.contentEditable = no
    @currentEdit.classList.remove 'editing'
    @currentEdit = null

    if @currentEditCallBack
      @currentEditCallBack()
      @currentEditCallBack = null

  _discardEdit: ->
    return unless @currentEdit?

    @rootView.kilidScopeForEdit.deactivate()
    @currentEdit.contentEditable = no
    @currentEdit.classList.remove 'editing'
    @currentEdit = null

    if @currentEditDiscardCallBack
      @currentEditDiscardCallBack()
      @currentEditDiscardCallBack = null

  _initNewBtn: ->
    @newBtn = Foxie('.theatrejs-workspaceList-workspace').putIn(@node)
    @newBtn.node.innerHTML = '+'

    @rootView.moosh.onClick(@newBtn)
    .onDone =>
      @newBtn.node.innerHTML = ''
      @_startEdit @newBtn, =>
        if @newBtn.node.innerHTML isnt ''
          @model.get(@newBtn.node.innerHTML)
        @newBtn.node.innerHTML = '+'

      , =>
        @newBtn.node.innerHTML = '+'

  show: ->
    return if @visible

    @node.addClass 'visible'
    @visible = yes

    @rootView.moosh.onClickOutside @node, =>
      do @hide

    @_emit 'show'

  hide: ->
    if @visible
      @_storeEdit()
      @node.removeClass 'visible'
      @visible = no

    @_emit 'hide'
    return