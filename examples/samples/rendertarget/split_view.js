import { GUI } from "dat.gui"
import {
  MeshMaterial3D,
  BasicMaterial,
  CircleGeometry,
  BoxGeometry,
  UVSphereGeometry,
  IcosphereGeometry,
  CylinderGeometry,
  QuadGeometry,
  Quaternion,
  WebGLRenderer,
  TextureLoader,
  PerspectiveProjection,
  Camera,
  WebGLCanvasSurface,
  CanvasTarget,
  TextureType,
  SkyBox,
  ViewRectangle
} from "webgllis"

const settings = {
  slider: 0
}
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
const meshes = [
  new QuadGeometry(1, 1),
  new CircleGeometry(0.7),
  new BoxGeometry(),
  new UVSphereGeometry(0.7),
  new IcosphereGeometry(0.7),
  new CylinderGeometry(0.7),
]

//create objects
const objects = meshes.map(mesh => new MeshMaterial3D(mesh, material))
const skyBox = new SkyBox({
  day,
})

// transform objects to their positions
objects.forEach((object, i) => {
  const stepX = 1.6
  const stepY = 2
  const startX = -1.6
  const startY = 1.6
  const number = 3

  object.transform.position.x = startX + stepX * (i % number)
  object.transform.position.y = startY - Math.floor(i / number) * stepY
})

// set up scissors
renderTarget1.scissor = new ViewRectangle()
renderTarget2.scissor = new ViewRectangle()

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
  objects.forEach(object => object.transform.orientation.multiply(
    Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)
  ))

  renderer.render([skyBox, ...objects], surface, camera1)
  renderer.render(objects, surface, camera2)
  requestAnimationFrame(update)
}

function updateView() {
  const fullWidth = innerWidth * devicePixelRatio
  const fullHeight = innerWidth * devicePixelRatio

  canvas.style.width = innerWidth + "px"
  canvas.style.height = innerHeight + "px"
  canvas.width = fullWidth
  canvas.height = fullHeight

  if (camera1.projection instanceof PerspectiveProjection) {
    camera1.projection.aspect = fullWidth / fullHeight
  }
  if (camera2.projection instanceof PerspectiveProjection) {
    camera2.projection.aspect = fullWidth / fullHeight
  }
}

// gui controls
const controls = new GUI()
const screenFolder = controls.addFolder("Settings")
const slider = screenFolder.add(settings, 'slider', 0, 1).name("Slider")
slider.onChange(updateRenderTargets)
screenFolder.open()

/**
 * @param {number} value
 */
function updateRenderTargets(value) {
  if (renderTarget1.scissor && renderTarget2.scissor) {
    renderTarget1.scissor.size.set(value, 1)
    renderTarget2.scissor.offset.set(value, 0)
    renderTarget2.scissor.size.set(1 - value, 1)
  }
}