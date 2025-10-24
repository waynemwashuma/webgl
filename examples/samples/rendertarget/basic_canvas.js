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
  ViewRectangle,
  TextureType,
  SkyBox
} from "webgllis"
import { GUI } from "dat.gui";

const fullWidth = innerWidth * devicePixelRatio
const fullHeight = innerWidth * devicePixelRatio
const canvas = document.createElement('canvas')
const surface = new WebGLCanvasSurface(canvas)
const renderTarget = new CanvasTarget()
const renderer = new WebGLRenderer()
const camera = new Camera()
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

//transform objects to thier positions
objects.forEach((object, i) => {
  const stepX = 1.6
  const stepY = 2
  const startX = -1.6
  const startY = 1.6
  const number = 3

  object.transform.position.x = startX + stepX * (i % number)
  object.transform.position.y = startY - Math.floor(i / number) * stepY
})
// set up render target
renderTarget.viewport.size.set(fullWidth, fullHeight)
//set up the camera
camera.target = renderTarget
camera.transform.position.z = 5
if (camera.projection instanceof PerspectiveProjection) {
  camera.projection.fov = Math.PI / 180 * 120
  camera.projection.aspect = innerWidth / innerHeight
}

document.body.append(canvas)
updateView()
requestAnimationFrame(update)

function update() {
  objects.forEach(object => object.transform.orientation.multiply(
    Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)
  ))

  renderer.render([skyBox, ...objects], surface, camera)
  requestAnimationFrame(update)
}

function updateView() {
  canvas.style.width = innerWidth + "px"
  canvas.style.height = innerHeight + "px"
  canvas.width = fullWidth
  canvas.height = fullHeight
  if (camera.projection instanceof PerspectiveProjection) {
    camera.projection.aspect = innerWidth / innerHeight
  }
}

// gui controls
const settings = {
  enableScissors: false
}
const controls = new GUI()
const canvasopts = controls.addFolder("Canvas Render Target")
canvasopts.add(renderTarget.viewport.offset, 'x', 0, fullWidth).name("Viewport X")
canvasopts.add(renderTarget.viewport.offset, 'y', 0, fullHeight).name("Viewport Y")
canvasopts.add(renderTarget.viewport.size, 'x', 0, fullWidth).name("Viewport Width")
canvasopts.add(renderTarget.viewport.size, 'y', 0, fullHeight).name("Viewport Hieght")
/**@type {GUI} */
let scissorsFolder
canvasopts.add(settings, "enableScissors").onChange((value) => {
  if (value) {
    renderTarget.scissor = new ViewRectangle()
    renderTarget.scissor.size.set(fullWidth, fullHeight)
    scissorsFolder = canvasopts.addFolder('Scissors')
    scissorsFolder.add(renderTarget.scissor.offset, 'x', 0, fullWidth).name("Scissor X")
    scissorsFolder.add(renderTarget.scissor.offset, 'y', 0, fullHeight).name("Scissor Y")
    scissorsFolder.add(renderTarget.scissor.size, 'x', 0, fullWidth).name("Scissor Width")
    scissorsFolder.add(renderTarget.scissor.size, 'y', 0, fullHeight).name("Scissor Hieght")
  } else {
    canvasopts.removeFolder(scissorsFolder)
    renderTarget.scissor = undefined
  }
})
canvasopts.open()