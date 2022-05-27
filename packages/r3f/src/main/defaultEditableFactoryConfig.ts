import type {EditableFactoryConfig} from './editableFactoryConfigUtils'
import {
  createColorPropConfig,
  createNumberPropConfig,
  createVector,
  createVectorPropConfig,
  extendObjectProps,
} from './editableFactoryConfigUtils'
import type {
  DirectionalLight,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  PointLight,
  SpotLight,
} from 'three'
import {
  BoxHelper,
  CameraHelper,
  DirectionalLightHelper,
  PointLightHelper,
  SpotLightHelper,
} from 'three'

const baseObjectConfig = {
  props: {
    position: createVectorPropConfig('position'),
    rotation: createVectorPropConfig('rotation'),
    scale: createVectorPropConfig('scale', createVector([1, 1, 1])),
  },
  useTransformControls: true,
  icon: 'cube' as const,
  createHelper: (object: Object3D) => new BoxHelper(object, selectionColor),
}

const baseLightConfig = {
  ...extendObjectProps(baseObjectConfig, {
    intensity: createNumberPropConfig('intensity', 1),
    distance: createNumberPropConfig('distance'),
    decay: createNumberPropConfig('decay'),
  }),
  dimensionless: true,
}

const baseCameraConfig = {
  ...extendObjectProps(baseObjectConfig, {
    near: createNumberPropConfig('near', 0.1, {nudgeMultiplier: 0.1}),
    far: createNumberPropConfig('far', 2000, {nudgeMultiplier: 0.1}),
  }),
  updateObject: (camera: PerspectiveCamera | OrthographicCamera) => {
    camera.updateProjectionMatrix()
  },
  icon: 'camera' as const,
  dimensionless: true,
  createHelper: (camera: PerspectiveCamera) => new CameraHelper(camera),
}

const selectionColor = '#40AAA4'

const defaultEditableFactoryConfig = {
  group: {
    ...baseObjectConfig,
    icon: 'collection' as const,
    createHelper: (object: Object3D) => new BoxHelper(object, selectionColor),
  },
  mesh: {
    ...baseObjectConfig,
    icon: 'cube' as const,
    createHelper: (object: Object3D) => new BoxHelper(object, selectionColor),
  },
  spotLight: {
    ...extendObjectProps(baseLightConfig, {
      angle: createNumberPropConfig('angle', 0, {nudgeMultiplier: 0.001}),
      penumbra: createNumberPropConfig('penumbra', 0, {nudgeMultiplier: 0.001}),
    }),
    icon: 'spotLight' as const,
    createHelper: (light: SpotLight) =>
      new SpotLightHelper(light, selectionColor),
  },
  directionalLight: {
    ...extendObjectProps(baseObjectConfig, {
      intensity: createNumberPropConfig('intensity', 1),
    }),
    icon: 'sun' as const,
    dimensionless: true,
    createHelper: (light: DirectionalLight) =>
      new DirectionalLightHelper(light, 1, selectionColor),
  },
  pointLight: {
    ...baseLightConfig,
    icon: 'lightBulb' as const,
    createHelper: (light: PointLight) =>
      new PointLightHelper(light, 1, selectionColor),
  },
  perspectiveCamera: extendObjectProps(baseCameraConfig, {
    fov: createNumberPropConfig('fov', 50, {nudgeMultiplier: 0.1}),
    zoom: createNumberPropConfig('zoom', 1),
  }),
  orthographicCamera: baseCameraConfig,
  points: baseObjectConfig,
  line: baseObjectConfig,
  lineLoop: baseObjectConfig,
  lineSegments: baseObjectConfig,
  fog: {
    props: {
      color: createColorPropConfig('color'),
      near: createNumberPropConfig('near', 1, {nudgeMultiplier: 0.1}),
      far: createNumberPropConfig('far', 1000, {nudgeMultiplier: 0.1}),
    },
    useTransformControls: false,
    icon: 'cloud' as const,
  },
}

// Assert that the config is indeed of EditableFactoryConfig without actually
// forcing it to that type so that we can pass the real type to the editable factory
defaultEditableFactoryConfig as EditableFactoryConfig

export default defaultEditableFactoryConfig
