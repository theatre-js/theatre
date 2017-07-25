// @flow
// @note check license from facebook's nuclide

// The properties on this module depend on whether the importer is the main
// process or a renderer process.
declare module 'electron' {
  // Main process:
  declare var app: ?electron$app;
  declare var autoUpdater: ?electron$autoUpdater;
  declare var BrowserWindow: ?typeof electron$BrowserWindow;
  declare var contentTracing: ?electron$contentTracing;
  declare var dialog: ?electron$dialog;
  declare var globalShortcut: ?electron$globalShortcut;
  declare var ipcMain: ?electron$IpcMain;
  declare var Menu: ?typeof electron$Menu;
  declare var MenuItem: ?typeof electron$MenuItem;
  declare var powerMonitor: ?electron$powerMonitor;
  declare var powerSaveBlocker: ?electron$powerSaveBlocker;
  declare var protocol: ?electron$protocol;
  declare var session: ?electron$session;
  declare var electron$Tray: ?typeof electron$Tray;
  declare var webContents: ?electron$webContents;

  // Renderer process:
  declare var desktopCapturer: ?electron$desktopCapturer;
  declare var ipcRenderer: ?electron$IpcRenderer;
  declare var remote: ?electron$remote;
  declare var webFrame: ?electron$webFrame;

  // Both:
  declare var clipboard: electron$clipboard;
  declare var crashReporter: electron$crashReporter;
  declare var nativeImage: electron$nativeImage;
  declare var screen: electron$Screen;
  declare var shell: electron$shell;

  declare type electron$BrowserWindow = electron$BrowserWindow;
  declare type electron$Menu = electron$Menu;
  declare type electron$MenuItem = electron$MenuItem;
  declare type electron$NativeImage = electron$NativeImage;
  declare type electron$Screen = electron$Screen;
  declare type electron$WebContents = electron$WebContents;
}

// very common struct
type electron$rect = {
  x: number,
  y: number,
  width: number,
  height: number,
};

//------------------------------------------------------------------------------
// Custom DOM Elements
//------------------------------------------------------------------------------

/**
 * https://github.com/electron/electron/blob/master/docs/api/file-object.md
 */

// HTML5 File API but with a `path` attribute added.

/**
 * https://github.com/electron/electron/blob/master/docs/api/web-view-tag.md
 */

declare class WebviewElement extends HTMLElement {
  src: string,
  nodeintegration: boolean,
  disablewebsecurity: boolean,

  executeJavaScript(code: string, userGesture: ?boolean): void,
  getTitle(): string,
  // This used to be `getUrl`, but the old version was dropped in the electron bundled with Atom
  // 1.12, and the new version exists at least in Atom 1.10.2 onward.
  getURL(): string,
  // Not sure when this was introduced
  stop?: () => void,
  insertCSS(code: string): void,
  send(channel: string, ...args: Array<any>): void,
  openDevTools(): void,
}

/**
 * https://github.com/electron/electron/blob/master/docs/api/window-open.md
 */

// window.open

//------------------------------------------------------------------------------
// Modules for the Main Process
//------------------------------------------------------------------------------

/**
 * https://github.com/electron/electron/blob/master/docs/api/app.md
 */

type electron$app = {
  quit(): void,
  exit(exitCode?: number): void,
  relaunch(options?: {args?: Array<string>, execPath?: string}): void,
  isReady(): boolean,
  focus(): void,
  getAppPath(): string,
  getPath(name: string): string,
  setPath(name: string, path: string): void,
  getVersion(): string,
  getName(): string,
  setName(name: string): void,
  getLocale(): string,
  makeSingleInstance(callback: (argv: Array<string>, workingDirectory: string) => void): boolean,
  releaseSingleInstance(): void,
  disableHardwareAcceleration(): void,
};

/**
 * https://github.com/electron/electron/blob/master/docs/api/auto-updater.md
 */

type electron$autoUpdater = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/browser-window.md
 */

type electron$BrowserWindowOptions = {
  width?: number,
  height?: number,
  x?: number,
  y?: number,
  useContentSize?: boolean,
  center?: boolean,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number,
  resizable?: boolean,
  movable?: boolean,
  minimizable?: boolean,
  maximizable?: boolean,
  closable?: boolean,
  focusable?: boolean,
  alwaysOnTop?: boolean,
  fullscreen?: boolean,
  fullscreenable?: boolean,
  skipTaskbar?: boolean,
  kiosk?: boolean,
  title?: string,
  icon?: electron$NativeImage,
  show?: boolean,
  frame?: boolean,
  parent?: electron$BrowserWindow,
  modal?: boolean,
  acceptFirstMouse?: boolean,
  disableAutoHideCursor?: boolean,
  autoHideMenuBar?: boolean,
  enableLargerThanScreen?: boolean,
  backgroundColor?: string,
  hasShadow?: boolean,
  darkTheme?: boolean,
  transparent?: boolean,
  type?: 'desktop' | 'dock' | 'toolbar' | 'splash' | 'notification' |
         /* macOS */ 'desktop' | 'textured' |
         /* Windows */ 'toolbar',
  titleBarStyle?: 'default' | 'hidden' | 'hidden-inset',
  thickFrame?: boolean,
  webPreferences?: electron$BrowserWindowWebPreferences,
};

type electron$BrowserWindowWebPreferences = {
  nodeIntegration?: boolean,
  preload?: string,
  session?: electron$session,
  partition?: string,
  zoomFactor?: number,
  javascript?: boolean,
  webSecurity?: boolean,
  allowDisplayingInsecureContent?: boolean,
  allowRunningInsecureContent?: boolean,
  images?: boolean,
  textAreasAreResizable?: boolean,
  webgl?: boolean,
  webaudio?: boolean,
  plugins?: boolean,
  experimentalFeatures?: boolean,
  experimentalCanvasFeatures?: boolean,
  scrollBounce?: boolean,
  blinkFeatures?: string,
  disableBlinkFeatures?: string,
  defaultFontFamily?: {
    standard?: string,
    serif?: string,
    sansSerif?: string,
    monospace?: string,
  },
  defaultFontSize?: number,
  defaultMonospaceFontSize?: number,
  minimumFontSize?: number,
  defaultEncoding?: string,
  backgroundThrottling?: boolean,
  offscreen?: boolean,
};

type electron$BrowserWindowEvents =
  | 'page-title-updated'
  | 'close'
  | 'closed'
  | 'unresponsive'
  | 'responsive'
  | 'blur'
  | 'focus'
  | 'show'
  | 'hide'
  | 'ready-to-show'
  | 'maximize'
  | 'unmaximize'
  | 'minimize'
  | 'restore'
  | 'resize'
  | 'move'
  | 'moved'
  | 'enter-full-screen'
  | 'leave-full-screen'
  | 'enter-html-full-screen'
  | 'leave-html-full-screen'
  | 'context-menu'
  | 'app-command'         // Windows
  | 'scroll-touch-begin'  // macOS
  | 'scroll-touch-end'    // macOS
  | 'swipe';              // macOS

type electron$BrowserWindowListener = (
  event: electron$BrowserWindowEvents,
  callback: (event: Object, ...args: Array<any>) => void,
) => electron$BrowserWindow;

declare class electron$BrowserWindow {
  constructor(options: electron$BrowserWindowOptions): void,
  on: electron$BrowserWindowListener,
  once: electron$BrowserWindowListener,
  removeAllListeners(event?: electron$BrowserWindowEvents): electron$BrowserWindow,
  removeListener(event?: electron$BrowserWindowEvents, callback: Function): electron$BrowserWindow,
  send(channel: string, ...args: Array<any>): void,

  static getAllWindows(): Array<electron$BrowserWindow>,
  static getFocusedWindow(): ?electron$BrowserWindow,
  static fromWebContents(webContents: electron$WebContents): ?electron$BrowserWindow,
  static fromId(id: number): ?electron$BrowserWindow,
  static addDevToolsExtension(path: string): void,
  static removeDevToolsExtension(name: string): void,
  static getDevToolsExtensions(): {[name: string]: {[name: string]: string}},

  webContents: electron$WebContents,
  id: string,
  destroy(): void,
  close(): void,
  focus(): void,
  blur(): void,
  isFocused(): boolean,
  show(): void,
  showInactive(): void,
  hide(): void,
  isVisible(): boolean,
  isModal(): boolean,
  maximize(): void,
  unmaximize(): void,
  isMaximized(): boolean,
  minimize(): void,
  restore(): void,
  isMinimized(): boolean,
  setFullScreen(flag: boolean): void,
  isFullScreen(): boolean,
  setAspectRatio(aspectRatio: number, extraSize?: {width: number, height: number}): void, // macOS
  setBounds(options: electron$rect,  /* macOS */ animate?: boolean): void,
  getBounds(): electron$rect,
  setSize(width: number, height: number, /* macOS */ animate?: boolean): void,
  getSize(): [number, number],
  setContentSize(width: number, height: number, /* macOS */ animate?: boolean): void,
  getContentSize(): [number, number],
  setMinimumSize(width: number, height: number): void,
  getMinimumSize(): [number, number],
  setMaximumSize(width: number, height: number): void,
  getMaximumSize(): [number, number],
  setResizable(resizable: boolean): void,
  isResizable(): boolean,
  setMovable(movable: boolean): void, // macOS Windows
  isMovable(): boolean, // macOS Windows
  setMinimizable(minimizable: boolean): void, // macOS Windows
  isMinimizable(): boolean, // macOS Windows
  setMaximizable(maximizable: boolean): void, // macOS Windows
  isMaximizable(): boolean, // macOS Windows
  setFullScreenable(fullscreenable: boolean): void,
  isFullScreenable(): boolean,
  setClosable(closable: boolean): void, // macOS Windows
  isClosable(): boolean, // macOS Windows
  setAlwaysOnTop(flag: boolean): void,
  isAlwaysOnTop(): boolean,
  center(): void,
  setPosition(x: number, y: number, /* macOS */ animate?: boolean): void,
  getPosition(): [number, number],
  setTitle(title: string): void,
  getTitle(): string,
  setSheetOffset(offsetY: number, offsetX?: number): void, // macOS
  flashFrame(flag: boolean): void,
  setSkipTaskbar(skip: boolean): void,
  setKiosk(flag: boolean): void,
  isKiosk(): boolean,
  getNativeWindowHandle(): Buffer,
  hookWindowMessage(message: number, callback: Function): void, // Windows
  isWindowMessageHooked(message: number): boolean, // Windows
  unhookWindowMessage(message: number): void, // Windows
  unhookAllWindowMessages(): void, // Windows
  setRepresentedFilename(filename: string): void, // macOS
  getRepresentedFilename(): string, // macOS
  setDocumentEdited(edited: boolean): void, // macOS
  isDocumentEdited(): boolean, // macOS
  focusOnWebView(): void,
  blurWebView(): void,
  capturePage(rect: electron$rect, callback: (image: electron$NativeImage) => void): void,
  capturePage(callback: (image: electron$NativeImage) => void): void,
  loadURL(
    url: string,
    options?: {httpReferrer?: string, userAgent?: string, extraHeaders?: string},
  ): void,
  reload(): void,
  setMenu(menu: electron$Menu): void, // Linux Windows
  setProgressBar(progress: number): void,
  setOverlayIcon(overlay: electron$NativeImage, description: string): void, // Windows
  setHasShadow(hasShadow: boolean): void, // macOS
  hasShadow(): boolean, // macOS
  setThumbarButtons(buttons: Array<{
    icon: electron$NativeImage,
    click: Function,
    tooltip?: string,
    flags?: Array<'enabled' | 'disabled' | 'dismissonclick' | 'nobackground' |
                  'hidden' | 'noninteractive'>,
  }>): void, // Windows
  setThumbnailClip(region: electron$rect): void, // Windows
  showDefinitionForSelection(): void, // macOS
  setIcon(icon: electron$NativeImage): void, // Windows Linux
  setAutoHideMenuBar(hide: boolean): void,
  isMenuBarAutoHide(): boolean,
  setMenuBarVisibility(visible: boolean): void,
  isMenuBarVisible(): boolean,
  setVisibleOnAllWorkspaces(visible: boolean): void,
  isVisibleOnAllWorkspaces(): boolean,
  setIgnoreMouseEvents(ignore: boolean): void,
  setContentProtection(enable: boolean): void, // macOS Windows
  setFocusable(focusable: boolean): void, // Windows
  setParentWindow(parent: electron$BrowserWindow): void, // Linux macOS
  getParentWindow(): ?electron$BrowserWindow,
  getChildWindows(): Array<electron$BrowserWindow>,

  // Atom sets this during window setup (see: src/main-process/atom-window.coffee).
  loadSettings?: Object,
}

/**
 * https://github.com/electron/electron/blob/master/docs/api/content-tracing.md
 */

type electron$contentTracing = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/dialog.md
 */

type electron$dialog = {
  showOpenDialog(
    browserWindow?: electron$BrowserWindow,
    options: electron$dialogOpenOptions,
    callback?: Function,
  ): Array<string>,
  showSaveDialog(
    browserWindow?: electron$BrowserWindow,
    options: electron$dialogSaveOptions,
    callback?: Function,
  ): string,
  showMessageBox(
    browserWindow?: electron$BrowserWindow,
    options: electron$dialogMessageBoxOptions,
    callback?: Function,
  ): number,
  showErrorBox(title: string, content: string): void,
};

/**
 * https://github.com/electron/electron/blob/master/docs/api/dialog.md
 * See `dialog.showOpenDialog()`
 */

type electron$dialogOpenOptions = {
  title?: string,
  defaultPath?: string,
  buttonLabel?: string,
  filters?: Array<string>,
  properties?: Array<string>,
};

/**
 * https://github.com/electron/electron/blob/master/docs/api/dialog.md
 * See `dialog.showSaveDialog()`
 */

type electron$dialogSaveOptions = {
  title?: string,
  defaultPath?: string,
  buttonLabel?: string,
  filters?: Array<string>,
};

/**
 * https://github.com/electron/electron/blob/master/docs/api/dialog.md
 * See `dialog.showMessageBox()`
 */

type electron$dialogMessageBoxOptions = {
  type?: string,
  buttons?: Array<string>,
  defaultId?: number,
  title?: string,
  message?: string,
  detail?: string,
  icon?: electron$NativeImage,
  cancelId?: number,
  noLink?: boolean,
};

/**
 * https://github.com/electron/electron/blob/master/docs/api/global-shortcut.md
 */

type electron$globalShortcut = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/ipc-main.md
 */

declare class electron$IpcMain {}

/**
 * https://github.com/electron/electron/blob/master/docs/api/menu.md
 */

declare class electron$Menu {
  static setApplicationMenu(menu: electron$Menu): void,
  static getApplicationMenu(): ?electron$Menu,
  static sendActionToFirstResponder(action: string): void,
  static buildFromTemplate(templates: Array<electron$MenuItemOptions>): electron$Menu,
  popup(
    browserWindow: electron$BrowserWindow,
    x?: number,
    y?: number,
    positioningItem?: number,
  ): void,
  popup(x?: number, y?: number, positioningItem?: number): void,
  append(menuItem: electron$MenuItem): void,
  insert(pos: number, menuItem: electron$MenuItem): void,
  items: Array<electron$MenuItem>,
}

/**
 * https://github.com/electron/electron/blob/master/docs/api/menu-item.md
 */

type electron$MenuItemOptions = {
  click?: (
    menuItem: electron$MenuItem,
    browserWindow: electron$BrowserWindow,
    event: Object
  ) => void,
  role?: 'undo' | 'redo' | 'cut' | 'copy' | 'paste' | 'pasteandmatchstyle' |
        'selectall' | 'delete' | 'minimize' | 'close' | 'quit' | 'togglefullscreen' |
         // macOS-only
        'about' | 'hide' | 'hideothers' | 'unhide' | 'front' | 'zoom' | 'window' |
        'help' | 'services',
  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio',
  label?: string,
  sublabel?: string,
  accelerator?: string,
  icon?: electron$NativeImage,
  enabled?: boolean,
  visible?: boolean,
  checked?: boolean,
  submenu?: electron$MenuItem | electron$MenuItemOptions,
  id?: string,
  position?: string,
};

declare class electron$MenuItem {
  constructor(options: electron$MenuItemOptions): void,
  enabled: boolean,
  visible: boolean,
  checked: boolean,
}

/**
 * https://github.com/electron/electron/blob/master/docs/api/power-monitor.md
 */

type electron$powerMonitor = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/power-save-blocker.md
 */

type electron$powerSaveBlocker = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/protocol.md
 */

type electron$protocol = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/session.md
 */

type electron$session = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/system-preferences.md
 */

type electron$systemPreferences = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/tray.md
 */

declare class electron$Tray {}

/**
 * https://github.com/electron/electron/blob/master/docs/api/web-contents.md
 */

type electron$InputEventModifiers =
  Array<'shift' | 'control' | 'alt' | 'meta' |
        'isKeypad' | 'isAutoRepeat' | 'leftButtonDown' | 'middleButtonDown' |
        'rightButtonDown' | 'capsLock' | 'numLock' | 'left' | 'right'>;

declare class electron$WebContents extends events$EventEmitter {
  loadURL(
    url: string,
    options?: {httpReferrer?: string, userAgent?: string, extraHeaders?: string},
  ): void,
  downloadURL(url: string): void,
  getURL(): string,
  getTitle(): string,
  isDestroyed(): boolean,
  isFocused(): boolean,
  isLoading(): boolean,
  isLoadingMainFrame(): boolean,
  isWaitingForResponse(): boolean,
  stop(): void,
  reload(): void,
  reloadIgnoringCache(): void,
  canGoBack(): boolean,
  canGoForward(): boolean,
  canGoToOffset(offset: number): boolean,
  clearHistory(): void,
  goBack(): void,
  goForward(): void,
  goToIndex(index: number): void,
  goToOffset(index: number): void,
  isCrashed(): boolean,
  setUserAgent(userAgent: string): void,
  getUserAgent(): string,
  insertCSS(css: string): void,
  // Keep `result` as mixed (and not any) to make this unsafe function less so.
  executeJavaScript(code: string, callback: (result: mixed) => void): void,
  executeJavaScript(code: string, userGesture?: boolean, callback?: (result: mixed) => void): void,
  setAudioMuted(muted: boolean): void,
  isAudioMuted(): boolean,
  setZoomFactor(factor: number): void,
  getZoomFactor(callback: (factor: number) => void): void,
  setZoomLevel(level: number): void,
  getZoomLevel(callback: (level: number) => void): void,
  setZoomLevelLimits(minimumLevel: number, maximumLevel: number): void,
  setVisualZoomLevelLimits(minimumLevel: number, maximumLevel: number): void,
  setLayoutZoomLevelLimits(minimumLevel: number, maximumLevel: number): void,
  undo(): void,
  redo(): void,
  cut(): void,
  copy(): void,
  copyImageAt(x: number, y: number): void,
  paste(): void,
  pasteAndMatchStyle(): void,
  delete(): void,
  selectAll(): void,
  unselect(): void,
  replace(text: string): void,
  replaceMisspelling(text: string): void,
  insertText(text: string): void,
  inserfindInPagetText(
    text: string,
    options?: {
      forward?: boolean,
      findNext?: boolean,
      matchCase?: boolean,
      wordStart?: boolean,
      medialCapitalAsWordStart?: boolean,
    },
  ): void,
  stopFindInPage(action: 'clearSelection' | 'keepSelection' | 'activateSelection'): void,
  capturePage(rect: electron$rect, callback: (image: electron$NativeImage) => void): void,
  capturePage(callback: (image: electron$NativeImage) => void): void,
  hasServiceWorker(callback: (result: boolean) => void): void,
  unregisterServiceWorker(callback: (result: boolean) => void): void,
  print(options?: {silent?: boolean, printBackground?: boolean}): void,
  printToPDF(options: {
    marginsType: number,
    pageSize: string,
    pageSize: string,
    printBackground: boolean,
    printSelectionOnly: boolean,
    landscape: boolean,
  }, callback: (err: ?mixed, data: ?Buffer) => void): void,
  addWorkSpace(path: string): void,
  removeWorkSpace(path: string): void,
  openDevTools(options?: {mode: 'right' | 'bottom' | 'undocked' | 'detach'}): void,
  closeDevTools(): void,
  isDevToolsOpened(): boolean,
  isDevToolsFocused(): boolean,
  toggleDevTools(): void,
  inspectElement(x: number, y: number): void,
  inspectServiceWorker(): void,
  send(channel: string, ...args: Array<any>): void,
  enableDeviceEmulation(parameters: {
    screenPosition?: 'desktop' | 'mobile',
    screenSize: {width: number, height: number},
    viewPosition?: {x: number, y: number},
    deviceScaleFactor?: number,
    viewSize?: {width: number, height: number},
    fitToView?: boolean,
    offset?: {x: number, y: number},
    scale?: number,
  }): void,
  disableDeviceEmulation(): void,
  sendInputEvent(
    event:
      {
        type: 'keyDown' | 'keyUp' | 'char',
        modifiers?: electron$InputEventModifiers,
        keyCode: string,
      } | {
        type: 'mouseDown' | 'mouseUp' | 'mouseEnter' | 'mouseLeave' | 'contextMenu',
        modifiers?: electron$InputEventModifiers,
        x: number,
        y: number,
        button: 'left' | 'middle' | 'right',
        globalX: number,
        globalY: number,
        movementX: number,
        movementY: number,
        clickCount: number,
      } | {
        type: 'mouseWheel',
        modifiers?: electron$InputEventModifiers,
        x: number,
        y: number,
        button: 'left' | 'middle' | 'right',
        globalX: number,
        globalY: number,
        movementX: number,
        movementY: number,
        clickCount: number,
        deltaX: number,
        deltaY: number,
        wheelTicksX: number,
        wheelTicksY: number,
        accelerationRatioX: number,
        accelerationRatioY: number,
        hasPreciseScrollingDeltas: boolean,
        canScroll: boolean,
      },
  ): void,
  beginFrameSubscription(
    callback: (frameBuffer: Buffer, dirtyRect: electron$rect) => void,
  ): void,
  beginFrameSubscription(
    onlyDirty?: boolean,
    callback: (frameBuffer: Buffer, dirtyRect: electron$rect) => void,
  ): void,
  endFrameSubscription(): void,
  startDrag(item: {file: string, icon: electron$NativeImage}): void,
  savePage(
    fullPath: string,
    saveType: 'HTMLOnly' | 'HTMLComplete' | 'MHTML',
    callback: (error: ?mixed) => void,
  ): void,
  showDefinitionForSelection(): void,
  isOffscreen(): boolean,
  startPainting(): void,
  stopPainting(): void,
  isPainting(): boolean,
  setFrameRate(fps: number): void,
  getFrameRate(): ?number,

  id: number,
  session: electron$session,
  hostWebContents: ?electron$WebContents,
  devToolsWebContents: ?electron$WebContents,
  debugger: ?electron$Debugger,
}

declare class electron$Debugger extends events$EventEmitter {
  attach(protocolVersion?: string): void,
  isAttached(): boolean,
  detach(): void,
  sendCommand(
    method: string,
    callback?: (error: ?mixed, result: ?mixed) => void,
  ): void,
  sendCommand(
    method: string,
    commandParams?: Object,
    callback?: (error: ?mixed, result: ?mixed) => void,
  ): void,
}

type electron$webContents = {
  getAllWebContents(): Array<electron$WebContents>,
  getFocusedWebContents: ?electron$WebContents,
  fromId(id: number): ?electron$WebContents,
};

//------------------------------------------------------------------------------
// Modules for the Renderer Process (Web Page)
//------------------------------------------------------------------------------

/**
 * https://github.com/electron/electron/blob/master/docs/api/desktop-capturer.md
 */

type electron$desktopCapturer = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/ipc-renderer.md
 */

declare class electron$IpcRenderer {
  on(channel: string, callback: (...args: Array<any>) => void): electron$IpcRenderer,
  once(channel: string, callback: (...args: Array<any>) => void): electron$IpcRenderer,
  removeListener(channel: string, callback: (...args: Array<any>) => void): electron$IpcRenderer,
  removeAllListeners(channel?: string): electron$IpcRenderer,
  send(channel: string, ...args: Array<any>): void,
  sendSync(channel: string, ...args: Array<any>): void,
  sendToHost(channel: string, ...args: Array<any>): void,
}

/**
 * https://github.com/electron/electron/blob/master/docs/api/remote.md
 */

type electron$remote = {
  // main process built-in modules:
  app: electron$app,
  autoUpdater: electron$autoUpdater,
  BrowserWindow: typeof electron$BrowserWindow,
  contentTracing: electron$contentTracing,
  dialog: electron$dialog,
  globalShortcut: electron$globalShortcut,
  ipcMain: electron$IpcMain,
  Menu: typeof electron$Menu,
  MenuItem: typeof electron$MenuItem,
  powerMonitor: electron$powerMonitor,
  powerSaveBlocker: electron$powerSaveBlocker,
  protocol: electron$protocol,
  session: electron$session,
  electron$Tray: typeof electron$Tray,
  webContents: electron$webContents,
  // methods:
  require(module: string): any,
  getCurrentWindow(): electron$BrowserWindow,
  getCurrentWebContents(): electron$WebContents,
  getGlobal(name: string): ?mixed,
  process: typeof process,
};

/**
 * https://github.com/electron/electron/blob/master/docs/api/web-frame.md
 */

type electron$webFrame = {};


//------------------------------------------------------------------------------
// Modules for Both Processes
//------------------------------------------------------------------------------

/**
 * https://github.com/electron/electron/blob/master/docs/api/clipboard.md
 */

type electron$clipboard = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/crash-reporter.md
 */

type electron$crashReporter = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/native-image.md
 */

type electron$nativeImage = {
  createEmpty(): electron$NativeImage,
  createFromPath(path: string): electron$NativeImage,
  createFromBuffer(buffer: Buffer, scaleFactor?: number): electron$NativeImage,
  createFromDataURL(dataURL: string): electron$NativeImage,
};

declare class electron$NativeImage {
  toPNG(): Uint8Array,
  toJPEG(quality: number): Uint8Array,
  toBitmap(): Uint8Array,
  toDataURL(): string,
  getNativeHandle(): Uint8Array,
  isEmpty(): boolean,
  getSize(): {width: number, height: number},
  setTemplateImage(option: boolean): void,
  isTemplateImage(): boolean,
  // Deprecated, but Atom is behind - so keep them around.
  toPng(): Uint8Array,
  toJpeg(quality: number): Uint8Array,
  toDataUrl(): string,
}

/**
 * https://github.com/electron/electron/blob/master/docs/api/screen.md
 */

type electron$Display = {
  id: number,
  rotation: 0 | 90 | 180 | 270,
  scaleFactor: number,
  touchSupport: 'available' | 'unavailable' | 'unknown',
  bounds: electron$rect,
  size: {height: number, width: number},
  workArea: electron$rect,
  workAreaSize: {height: number, width: number},
};

type electron$DisplayEvents =
    'display-added'
  | 'display-removed'
  | 'display-metrics-changed';

type electron$ScreenListener = (
  event: electron$DisplayEvents,
  callback: (
    event: Object,
    display: electron$Display,
    changedMetrics?: Array<'bounds' | 'workArea' | 'scaleFactor' | 'rotation'>,
  ) => void,
) => electron$Screen;

declare class electron$Screen {
  on: electron$ScreenListener,
  once: electron$ScreenListener,
  removeAllListeners(event?: electron$DisplayEvents): electron$Screen,
  removeListener(event?: electron$DisplayEvents, callback: Function): electron$Screen,
  getCursorScreenPoint(): {x: number, y: number},
  getPrimaryDisplay(): electron$Display,
  getAllDisplays(): Array<electron$Display>,
  getDisplayNearestPoint(point: {x: number, y: number}): electron$Display,
  getDisplayMatching(rect: electron$rect): electron$Display,
}

/**
 * https://github.com/electron/electron/blob/master/docs/api/shell.md
 */

type electron$shell = {
  showItemInFolder(fullPath: string): void,
  openItem(fullPath: string): void,
  openExternal(url: string, options?: {activate: boolean}): void,
  moveItemToTrash(fullPath: string): boolean,
  beep(): void,
  // Windows-only
  writeShortcutLink(
    shortcutPath: string,
    operation?: 'create' | 'update' | 'replace',
    options?: {
      target: string,
      cwd?: string,
      args?: string,
      description?: string,
      icon?: string,
      iconIndex?: number,
      appUserModelId?: string,
    }
  ): void,
  // Windows-only
  readShortcutLink(shortcutPath: string): void,
};