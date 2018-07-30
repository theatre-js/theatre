import * as THREE from 'three'
import 'three/examples/js/controls/OrbitControls'

const fragmentShaderSource = `
  varying vec3 vCenter;
  float edgeFactorTri() {
    vec3 d = fwidth( vCenter.xyz );
    vec3 a3 = smoothstep( vec3( 0.0 ), d * 1.5, vCenter.xyz );
    return min( min( a3.x, a3.y ), a3.z );
  }
  void main() {
    gl_FragColor.rgb = mix( vec3( 1.0 ), vec3( 0.2 ), edgeFactorTri() );
    gl_FragColor.a = 1.0;
  }
  `

const vertexShaderSource = `
  attribute vec3 center;
  varying vec3 vCenter;
  void main() {
    vCenter = center;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
  `

const setupScene = () => {
  var camera, scene, renderer, sphere
  init()
  animate()
  function init() {
    var size = 150
    camera = makeCamera()
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x444444)

    makePlatformMesh(size)
    makeSphereMesh(size)

    renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
    window.addEventListener('resize', onWindowResize, false)
  }
  function makeCamera() {
    const camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      1,
      2000,
    )
    camera.position.z = 800
    camera.position.y = 100
    // camera.rotation
    var controls = new THREE.OrbitControls(camera)
    return camera
  }

  function makeSphereMesh(size) {
    let geometry = new THREE.SphereBufferGeometry(size / 2, 32, 16)
    const material = new THREE.MeshBasicMaterial({color: 0x888888})
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    var wireframe = new THREE.WireframeGeometry(geometry)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x111111,
      linewidth: 1,
    })
    var line = new THREE.LineSegments(wireframe, lineMaterial)
    line.material.depthTest = true
    line.material.opacity = 1
    line.material.transparent = true

    scene.add(line)
    sphere = line
  }

  function makePlatformMesh(size) {
    let geometry = new THREE.BoxBufferGeometry(size * 5, 1, size * 5, 10, 1, 10)
    const material = new THREE.MeshBasicMaterial({color: 0x00ff00})
    var wireframe = new THREE.WireframeGeometry(geometry)

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 1,
    })

    var line = new THREE.LineSegments(wireframe, lineMaterial)
    line.material.depthTest = true
    line.material.opacity = 0.25
    line.material.transparent = true
    line.position.y = -size / 2
    line.rotateY(Math.PI / 4)

    scene.add(line)
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }

  return {sphere}
}

export default setupScene
