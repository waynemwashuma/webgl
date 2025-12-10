import {
  MeshMaterial3D,
  BasicMaterial,
  Quaternion,
  WebGLRenderer,
  TextureLoader,
  PerspectiveProjection,
  Camera,
  WebGLRenderDevice,
  CanvasTarget,
  TextureType,
  SkyBox,
  CuboidMeshBuilder,
  MeshMaterialPlugin
} from "webgllis"

// performance monitor
const stats = new Stats()
stats.showPanel(1)
document.body.append(stats.dom)
stats.dom.removeAttribute('style')
stats.dom.classList.add('performance-monitor')

const canvas = document.createElement('canvas')
const renderDevice = new WebGLRenderDevice(canvas)
const renderer = new WebGLRenderer({
  plugins:[
    new MeshMaterialPlugin()
  ]
})

const renderTarget1 = new CanvasTarget()
const renderTarget2 = new CanvasTarget()
const renderTarget3 = new CanvasTarget()
const renderTarget4 = new CanvasTarget()

const camera1 = new Camera()
const camera2 = new Camera()
const camera3 = new Camera()
const camera4 = new Camera()

const textureLoader = new TextureLoader()
const texture = textureLoader.load({
  paths: ["/assets/images/uv.jpg"],
  textureSettings: {
    flipY: true
  }
})
const day = textureLoader.load({
  paths: [
    "/assets/images/skybox/miramar_right.png",
    "/assets/images/skybox/miramar_left.png",
    "/assets/images/skybox/miramar_top.png",
    "/assets/images/skybox/miramar_bottom.png",
    "/assets/images/skybox/miramar_back.png",
    "/assets/images/skybox/miramar_front.png",

  ],
  type: TextureType.TextureCubeMap
})
const object = new MeshMaterial3D(new CuboidMeshBuilder().build(), new BasicMaterial({
  mainTexture: texture
}))
const skyBox = new SkyBox({
  day,
  night:day
})
// set up render target viewports
renderTarget1.viewport.offset.set(0, 0)
renderTarget1.viewport.size.set(0.5, 0.5)
renderTarget2.viewport.offset.set(0.5, 0)
renderTarget2.viewport.size.set(0.5, 0.5)
renderTarget3.viewport.offset.set(0, 0.5)
renderTarget3.viewport.size.set(0.5, 0.5)
renderTarget4.viewport.offset.set(0.5, 0.5)
renderTarget4.viewport.size.set(0.5, 0.5)

//set up the cameras
camera1.target = renderTarget1
camera2.target = renderTarget2
camera3.target = renderTarget3
camera4.target = renderTarget4

camera1.transform.position.z = 5
camera2.transform.position.z = 5
camera3.transform.position.z = 5
camera4.transform.position.z = 5

if (
  camera1.projection instanceof PerspectiveProjection &&
  camera2.projection instanceof PerspectiveProjection &&
  camera3.projection instanceof PerspectiveProjection &&
  camera4.projection instanceof PerspectiveProjection
) {
  camera1.projection.fov = Math.PI / 180 * 60
  camera2.projection.fov = Math.PI / 180 * 60
  camera3.projection.fov = Math.PI / 180 * 60
  camera4.projection.fov = Math.PI / 180 * 60
}

document.body.append(canvas)
updateView()
addEventListener('resize', updateView)
requestAnimationFrame(update)

function update() {
  stats.begin()
  object.transform.orientation.multiply(
    Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)
  )

  renderer.render([skyBox, object], renderDevice, camera1)
  renderer.render([skyBox, object], renderDevice, camera2)
  renderer.render([skyBox, object], renderDevice, camera3)
  renderer.render([skyBox, object], renderDevice, camera4)

  camera1.transform.orientation.multiply(
    Quaternion.fromEuler(Math.PI / 1000, 0, 0)
  )
  camera2.transform.orientation.multiply(
    Quaternion.fromEuler(0, Math.PI / 1000, 0)
  )
  camera3.transform.orientation.multiply(
    Quaternion.fromEuler(0, 0, Math.PI / 1000)
  )
  camera4.transform.orientation.multiply(
    Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)
  )
  stats.end()

  requestAnimationFrame(update)
}

function updateView() {
  const fullWidth = innerWidth * devicePixelRatio
  const fullHeight = innerWidth * devicePixelRatio
  const halfFullWidth = fullWidth / 2
  const halfFullHeight = fullHeight / 2

  canvas.style.width = innerWidth + "px"
  canvas.style.height = innerHeight + "px"
  canvas.width = fullWidth
  canvas.height = fullHeight

  if (
    camera1.projection instanceof PerspectiveProjection &&
    camera2.projection instanceof PerspectiveProjection &&
    camera3.projection instanceof PerspectiveProjection &&
    camera4.projection instanceof PerspectiveProjection
  ) {
    camera1.projection.aspect = halfFullWidth / halfFullHeight
    camera2.projection.aspect = halfFullWidth / halfFullHeight
    camera3.projection.aspect = halfFullWidth / halfFullHeight
    camera4.projection.aspect = halfFullWidth / halfFullHeight
  }
}