import {
  MeshMaterial3D,
  BasicMaterial,
  Quaternion,
  WebGLRenderer,
  TextureLoader,
  PerspectiveProjection,
  Camera,
  WebGLCanvasSurface,
  CanvasTarget,
  TextureType,
  SkyBox,
  CuboidMeshBuilder
} from "webgllis"

const canvas = document.createElement('canvas')
const surface = new WebGLCanvasSurface(canvas)
const renderTarget1 = new CanvasTarget()
const renderTarget2 = new CanvasTarget()
const renderer = new WebGLRenderer()

const camera1 = new Camera()
const camera2 = new Camera()
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
  type: TextureType.TextureCubeMap,
})
const material = new BasicMaterial({
  mainTexture: texture
})

//create objects
const object = new MeshMaterial3D(new CuboidMeshBuilder().build(), material)
const skyBox = new SkyBox({
  day,
})

// set up render targets
renderTarget1.viewport.offset.set(0, 0)
renderTarget1.viewport.size.set(0.5, 1)
renderTarget2.viewport.offset.set(0.5, 0)
renderTarget2.viewport.size.set(0.5, 1)

//set up the cameras
camera1.target = renderTarget1
camera2.target = renderTarget2
camera1.transform.position.z = 5
camera2.transform.position.z = 5
if (
  camera1.projection instanceof PerspectiveProjection &&
  camera2.projection instanceof PerspectiveProjection
) {
  camera1.projection.fov = Math.PI / 180 * 90
  camera2.projection.fov = Math.PI / 180 * 90
}

document.body.append(canvas)
updateView()
addEventListener('resize', updateView)
requestAnimationFrame(update)

function update() {
  object.transform.orientation.multiply(
    Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)
  )

  renderer.render([skyBox, object], surface, camera1)
  renderer.render([object], surface, camera2)
  requestAnimationFrame(update)
}

function updateView() {
  const fullWidth = innerWidth * devicePixelRatio
  const fullHeight = innerWidth * devicePixelRatio
  const halfFullWidth = fullWidth / 2

  canvas.style.width = innerWidth + "px"
  canvas.style.height = innerHeight + "px"
  canvas.width = fullWidth
  canvas.height = fullHeight

  if (camera1.projection instanceof PerspectiveProjection) {
    camera1.projection.aspect = halfFullWidth / fullHeight
  }
  if (camera2.projection instanceof PerspectiveProjection) {
    camera2.projection.aspect = halfFullWidth / fullHeight
  }
}