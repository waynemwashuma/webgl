import {
  MeshMaterial3D,
  CuboidMeshBuilder,
  Quaternion,
  DirectionalLight,
  WebGLRenderer,
  TextureLoader,
  BasicMaterial,
  PerspectiveProjection,
  Camera,
  WebGLCanvasSurface,
  MeshMaterialPlugin
} from 'webgllis';

const canvas = document.createElement('canvas')
const surface = new WebGLCanvasSurface(canvas)
const renderer = new WebGLRenderer({
  plugins:[
    new MeshMaterialPlugin()
  ]
})
const camera = new Camera()
const light = new DirectionalLight()

light.direction.set(0, -1, -1).normalize()
renderer.lights.ambientLight.intensity = 0.15
renderer.lights.directionalLights.add(light)

const textureLoader = new TextureLoader()
const texture = textureLoader.load({
  paths: ["/assets/images/uv.jpg"],
  textureSettings:{
    flipY:true
  }
})
const meshBuilder = new CuboidMeshBuilder()
meshBuilder.width = 0.5 
meshBuilder.height = 0.5 
meshBuilder.depth = 0.5

const mesh = meshBuilder.build()
const material = new BasicMaterial({
  mainTexture: texture
})
const parent = new MeshMaterial3D(mesh, material)
const child = new MeshMaterial3D(mesh, material)

child.transform.position.x = 1
camera.transform.position.z = 2
if (camera.projection instanceof PerspectiveProjection) {
  camera.projection.fov = Math.PI / 180 * 120
  camera.projection.aspect = innerWidth / innerHeight
}
parent.add(child)

const rotation = Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)

document.body.append(canvas)
updateView()
addEventListener("resize", updateView)
requestAnimationFrame(update)

function update() {
  parent.transform.orientation.multiply(rotation)

  renderer.render([parent],surface, camera)
  requestAnimationFrame(update)
}

function updateView() {
  canvas.style.width = innerWidth + "px"
  canvas.style.height = innerHeight + "px"
  canvas.width = innerWidth * devicePixelRatio
  canvas.height = innerHeight * devicePixelRatio

  if (camera.projection instanceof PerspectiveProjection) {
    camera.projection.aspect = innerWidth / innerHeight
  }
}