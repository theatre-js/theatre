// Inspired by https://github.com/Fyrestar/THREE.InfiniteGridHelper
import {
  Color,
  DoubleSide,
  GLSL3,
  Mesh,
  PlaneBufferGeometry,
  ShaderMaterial,
} from 'three'

export class InfiniteGridHelper extends Mesh {
  constructor({
    divisions = 10,
    scale = 0.1,
    color = new Color('white'),
    distance = 8000,
    subgridOpacity = 0.05,
    gridOpacity = 0.15,
  } = {}) {
    const geometry = new PlaneBufferGeometry(2, 2, 1, 1)

    const material = new ShaderMaterial({
      // Needs to be set so threejs doesn't mess things up in glsl3 code by trying to make glsl1 forward compatible
      glslVersion: GLSL3,
      side: DoubleSide,
      uniforms: {
        uScale: {
          value: scale,
        },
        uDivisions: {
          value: divisions,
        },
        uColor: {
          value: color,
        },
        uDistance: {
          value: distance,
        },
        uSubgridOpacity: {
          value: subgridOpacity,
        },
        uGridOpacity: {
          value: gridOpacity,
        },
      },
      transparent: true,
      // language=GLSL
      vertexShader: `
          out vec3 worldPosition;
          uniform float uDistance;

          void main() {
              // Scale the plane by the drawing distance
              worldPosition = position.xzy * uDistance;
              worldPosition.xz += cameraPosition.xz;

              gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPosition, 1.0);
          }
      `,
      // language=GLSL
      fragmentShader: `
          out vec4 fragColor;
          in vec3 worldPosition;

          uniform float uDivisions;
          uniform float uScale;
          uniform vec3 uColor;
          uniform float uDistance;
          uniform float uSubgridOpacity;
          uniform float uGridOpacity;

          float getGrid(float gapSize) {
              vec2 worldPositionByDivision = worldPosition.xz / gapSize;

              // Inverted, 0 where line, >1 where there's no line
              // We use the worldPosition (which in this case we use similarly to UVs) differential to control the anti-aliasing
              // We need to do the -0.5)-0.5 trick because the result fades out from 0 to 1, and we want both
              // worldPositionByDivision == 0.3 and worldPositionByDivision == 0.7 to result in the same fade, i.e. 0.3,
              // otherwise only one side of the line will be anti-aliased
              vec2 grid = abs(fract(worldPositionByDivision-0.5)-0.5) / fwidth(worldPositionByDivision) / 2.0;
              float gridLine = min(grid.x, grid.y);

              // Uninvert and clamp
              return 1.0 - min(gridLine, 1.0);
          }

          void main() {
              float cameraDistanceToGridPlane = distance(cameraPosition.y, worldPosition.y);
              float cameraDistanceToFragmentOnGridPlane = distance(cameraPosition.xz, worldPosition.xz);

              // The size of the grid and subgrid are powers of each other and they are determined based on camera distance.
              // The current grid will become the next subgrid when it becomes too small, and its next power becomes the new grid.
              float subGridPower = pow(uDivisions, floor(log(cameraDistanceToGridPlane) / log(uDivisions)));
              float gridPower = subGridPower * uDivisions;

              // If we want to fade both the grid and its subgrid, we need to displays 3 different opacities, with the next grid being the third
              float nextGridPower = gridPower * uDivisions;

              // 1 where grid, 0 where no grid
              float subgrid = getGrid(subGridPower * uScale);
              float grid = getGrid(gridPower * uScale);
              float nextGrid = getGrid(nextGridPower * uScale);

              // Where we are between the introduction of the current grid power and when we switch to the next grid power
              float stepPercentage = (cameraDistanceToGridPlane - subGridPower)/(gridPower - subGridPower);

              // The last x percentage of the current step over which we want to fade
              float fadeRange = 0.3;

              // We calculate the fade percentage from the step percentage and the fade range
              float fadePercentage = max(stepPercentage - 1.0 + fadeRange, 0.0) / fadeRange;

              // Set base opacity based on how close we are to the drawing distance, with a cubic falloff
              float baseOpacity = subgrid * pow(1.0 - min(cameraDistanceToFragmentOnGridPlane / uDistance, 1.0), 3.0);

              // Shade the subgrid
              fragColor = vec4(uColor.rgb, (baseOpacity - fadePercentage) * uSubgridOpacity);

              // Somewhat arbitrary additional fade coefficient to counter anti-aliasing popping when switching between grid powers
              float fadeCoefficient = 0.5;

              // Shade the grid
              fragColor.a = mix(fragColor.a, baseOpacity * uGridOpacity - fadePercentage * (uGridOpacity - uSubgridOpacity) * fadeCoefficient, grid);

              // Shade the next grid
              fragColor.a = mix(fragColor.a, baseOpacity * uGridOpacity, nextGrid);

              if (fragColor.a <= 0.0) discard;
          }
      `,

      extensions: {
        derivatives: true,
      },
    })

    super(geometry, material)

    this.frustumCulled = false
  }
}
