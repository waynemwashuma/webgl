import {
  PerspectiveProjection,
  Quaternion,
  WebGLRenderer,
  SkyBox,
  TextureLoader,
  TextureType,
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
const textureLoader = new TextureLoader()
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
const night = textureLoader.load({
  paths: [
    "/assets/images/skybox/grimmnight_right.png",
    "/assets/images/skybox/grimmnight_left.png",
    "/assets/images/skybox/grimmnight_top.png",
    "/assets/images/skybox/grimmnight_bottom.png",
    "/assets/images/skybox/grimmnight_back.png",
    "/assets/images/skybox/grimmnight_front.png",
  ],
  type: TextureType.TextureCubeMap
})
const skyBox = new SkyBox({
  day,
  night,
})
camera.transform.position.z = 2
if (camera.projection instanceof PerspectiveProjection) {
  camera.projection.fov = Math.PI / 2
  camera.projection.aspect = innerWidth / innerHeight
}

let number = 0, direction = 1
const interval = 0.001
const rotation = Quaternion.fromEuler(0, Math.PI / 1000, 0)

document.body.append(canvas)
updateView()
addEventListener("resize", updateView)
requestAnimationFrame(update)

function update() {
  skyBox.material.lerp = number

  const next = number + interval * direction
  if (number > 1 || number < 0) {
    direction *= -1
    if (direction === -1) {
      number = 1
    } else {
      number = 0
    }
  } else {
    number = next
  }

  camera.transform.orientation.multiply(rotation)
  renderer.render([skyBox],surface, camera)
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