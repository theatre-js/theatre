import * as THREE from 'three'
// import 'three/examples/js/controls/OrbitControls'

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

const getDims = () => ({
  width: window.innerWidth / 2,
  height: window.innerHeight,
})

const setupScene = () => {
  let camera: THREE.Camera,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    sphere: THREE.Group,
    sphereGroup
  init()
  animate()
  function init() {
    const size = 150
    camera = makeCamera()
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x444444)

    makePlatformMesh(size)
    makeSphereMesh(size)

    renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.setPixelRatio(window.devicePixelRatio)
    const dims = getDims()
    renderer.setSize(dims.width, dims.height)
    document.body.appendChild(renderer.domElement)
    // renderer.domElement.style.transform = 'scale(0.5, 0.5)'
    window.addEventListener('resize', onWindowResize, false)
  }
  function makeCamera() {
    const dims = getDims()

    const camera = new THREE.PerspectiveCamera(
      40,
      dims.width / (dims.height / 1),
      1,
      4000,
    )
    camera.position.z = 1100
    camera.position.y = 150
    camera.lookAt(0, 0, 0)
    // camera.rotateZ(1)
    // tslint:disable-next-line:prefer-const
    // let controls = new THREE.OrbitControls(camera)
    return camera
  }

  function makeSphereMesh(size: number) {
    const geometry = new THREE.SphereBufferGeometry(size / 2, 32, 16)
    const material = new THREE.MeshBasicMaterial({color: 0x888888})
    const mesh = new THREE.Mesh(geometry, material)
    // scene.add(mesh)

    const wireframe = new THREE.WireframeGeometry(geometry)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x111111,
      linewidth: 1,
    })
    const line = new THREE.LineSegments(wireframe, lineMaterial)
    line.material.depthTest = true
    line.material.opacity = 1
    line.material.transparent = true

    // scene.add(line)

    const group = new THREE.Group()
    group.add(line)
    group.add(mesh)
    sphere = group
    group.position.y = size / 2

    sphereGroup = new THREE.Group()
    sphereGroup.add(sphere)
    scene.add(sphereGroup)
  }

  function makePlatformMesh(size: number) {
    const geometry = new THREE.BoxBufferGeometry(
      size * 5,
      1,
      size * 5,
      10,
      1,
      10,
    )
    const material = new THREE.MeshBasicMaterial({color: 0x00ff00})
    const wireframe = new THREE.WireframeGeometry(geometry)

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 1,
    })

    const line = new THREE.LineSegments(wireframe, lineMaterial)
    line.material.depthTest = true
    line.material.opacity = 0.25
    line.material.transparent = true
    line.position.y = -size / 2
    line.rotateY(Math.PI / 4)

    scene.add(line)
  }

  function onWindowResize() {
    const dims = getDims()
    camera.aspect = dims.width / dims.height
    camera.updateProjectionMatrix()
    renderer.setSize(dims.width, dims.height)
  }

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }

  return {sphere, sphereGroup}
}

export default setupScene
