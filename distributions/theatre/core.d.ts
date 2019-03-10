export as namespace Theatre

/**
 * Returns a project with the given name.
 *
 * Docs: https://docs.theatrejs.com/api.html#theatre-getproject
 *
 * @param name - Case sensitive, and must be 3+ characters long.
 * @param config - Project config (required in core mode)
 * @returns If a project with this name already exists, then it'll be returned. If not, a new one will be created.
 */
export function getProject(
  name: string,
  config?: {
    /**
     * State of the project. Required in core mode.
     *
     * Docs: https://docs.theatrejs.com/#saving-sate-to-a-file-git
     */
    state?: any
  },
): Project

/**
 * A Theatre project
 *
 * Docs: https://docs.theatrejs.com/api.html#project
 */
export interface Project {
  /**
   * When in development mode, Theatre loads each project's state from the browser's storage.
   * This promise gets resolved when the state has been loaded from the browser and animations
   * are ready for playback.
   *
   * In core mode, no loading is necessary, so this is already a resolved promise.
   */
  ready: Promise<void>

  /**
   * When in development mode, Theatre loads each project's state from the browser's storage.
   * This variable is true when the state has been loaded from the browser and animations
   * are ready to be played.
   *
   * In core mode, no loading is necessary, so isReady is always true.
   */
  isReady: boolean

  /**
   * The project's AdaptersManager, explained here: https://docs.theatrejs.com/adapters.html#adapters
   */
  adapters: AdaptersManager

  /**
   * Returns an instance of Timeline
   * 
   * Learn more here: https://docs.theatrejs.com/api.html#project-gettimeline
   * 
   * @param timelineName - The name of the timeline
   * @param [instanceName="default"] - In case you're creating multiple instances of the same timeline, you must provide a unique name to each instance
   * 
   */
  getTimeline(timelineName: string, instanceName?: string): Timeline
}

export interface AdaptersManager {
  /**
   * Add a new adapter.
   * 
   * Adapters are a simple way to avoid repeating the prop types of each object.
   * 
   * Learn more here: https://docs.theatrejs.com/adapters.html#adapters
   * 
   * @param adapter - A valid Adapter object
   */
  add(adapter: Adapter): void
}

type VoidFn = () => void

export interface Adapter {
  /**
   * Each adapter must have a name unique within the project
   */
  name: string

  /**
   * This method determines whether this adapter can handle the given native object.
   * 
   * Learn more here: https://docs.theatrejs.com/adapters.html
   * 
   * @param nativeObject - A reference to the nativeObject provided to Timelnie.getObject(_, nativeObject)
   * @returns If the native object can be handled by this adapter, then return true, otherwise false.
   */
  canHandle(nativeObject: unknown): boolean

  /**
   * This function takes a reference to the native object, and returns
   * 
   * Learn more here: https://docs.theatrejs.com/adapters.html
   * 
   * @param nativeObject - A reference to the nativeObject provided to Timelnie.getObject(_, nativeObject)
   * @returns The config of the Theatre object
   */
  getConfig(nativeObject: unknown): ObjectConfig

  /**
   * start() gets called every time a handleable object is added to any timeline within the current project.
   * You're free to perform any task within the start() method, but most commonly you'd set up the onValuesChange() listener.
   * It is also required that the start() function returns a stop() function.
   * The stop function gets called whenever the object is removed from the scene.
   * 
   * Learn more here: https://docs.theatrejs.com/adapters.html
   * 
   * @param object - A reference to the theatre object (not to be confused with the native object)
   * @returns A function that Theatre will call when the timeline is destroyed
   */
  start(object: TheatreObject): VoidFn
}

export type ObjectConfig = {
  /**
   * The props of this object.
   * 
   * Learn more here: https://docs.theatrejs.com/api.html#theatreobjectconfig
   */
  props: Record<string, PropTypeDescriptor>
}

type NumberPropTypeDescriptor = {
  /**
   * The number prop type (currently the only prop type)
   * 
   * Learn more here: https://docs.theatrejs.com/api.html#theatreobjectconfig
   */
  type: 'number'
}

export type PropTypeDescriptor = NumberPropTypeDescriptor

export interface Timeline {
  /**
   * A getter/setter for the current time of the timeline, in milliseconds.
   * 
   * Learn more here: https://docs.theatrejs.com/api.html#timeline-time
   * 
   * @example console.log(timeline.time)
   * @example timeline.time = 2000
   * 
   */
  time: number

  /**
   * A boolean determining whether the timeline is currently playing
   */
  playing: boolean

  /**
   * Pauses playback
   */
  pause(): void

  /**
   * Plays the timeline. If the timeline is already playing, the playbackConfig will be overridden.
   * 
   * Docs: https://docs.theatrejs.com/api.html#timeline-play
   * 
   * @param playbackConfig - Customise the playback
   * @returns Promise<boolean>. If the playback finishes, the boolean will be true.
   * If it is interrupted (such as by calling timeline.pause()), then the boolean will be false.
   */
  play(
    playbackConfig?: {
      /**
       * How many times to play. Defaults to 1. Can be Infinity
       */
      iterationCount?: number

      /**
       * Limit the playback to this range.
       * 
       * Defaults to {from: 0, to: timeline.duration}
       */
      range?: {
        /**
         * In milliseconds, starting at 0
         */
        from: number
        /**
         * In milliseconds. Must not be larger than the duration of the timeline
         */
        to: number
      }

      /**
       * The rate of playback. Defaults to 1
       */
      rate?: number

      /**
       * Direction of playback, similar to that of CSS animations. Defaults to `normal`
       */
      direction?: 'normal' | 'reverse' | 'alternate' | 'alternateReverse'
    },
  ): Promise<boolean>

  /**
   * Takes a name, a native object, and optionally an ObjectConfig, and returns a TheatreObject.
   * 
   * Docs: https://docs.theatrejs.com/api.html#timeline-getobject
   * 
   * @param name - Name of the object. If two timeline.getObject() calls have the same name,
   * the same TheatreObject will be returned. The config of the second one will override that of
   * the first one.
   * @param nativeObject -  Could be any value, including null. However, it is better to provide a reference to
   * the actual native object being controlled.
   * @param config - If an adapter can handle this native object, then config will be ignored.
   * Otherwise, a value conforming to TheatreObjectConfig must be provided.
   * @returns An instance of TheatreObject
   */
  getObject(
    path: string,
    nativeObject: unknown,
    config?: ObjectConfig,
  ): TheatreObject
}

export interface TheatreObject {
  /**
   * The name of the object
   * 
   * Docs: https://docs.theatrejs.com/api.html#theatreobject-name
   */
  name: string

  /**
   * A reference to the nativeObject provided to timeline.getObject(_, nativeObject)
   * 
   * Docs: https://docs.theatrejs.com/api.html#theatreobject-nativeobject
   */
  nativeObject: any

  /**
   * An object with the current values of all of the props of this nativeObject
   * 
   * Docs: https://docs.theatrejs.com/api.html#theatreobject-currentvalues
   */
  currentValues: Record<string, number>

  /**
   * Takes a callback and calls it whenever the value of any of the props of this object have changed
   * 
   * Docs: https://docs.theatrejs.com/api.html#theatreobject-onvalueschange
   * 
   * @param callback - Gets invoked every time any of the props of the object has a new value
   * @returns A function that you can invoke to stop listening to the value changes
   */
  onValuesChange(
    callback: (values: Record<string, number>, time: number) => void,
  ): VoidFn
}
