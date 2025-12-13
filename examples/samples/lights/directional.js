import {
  MeshMaterial3D,
  WebGLRenderer,
  TextureLoader,
  PerspectiveProjection,
  Camera,
  WebGLRenderDevice,
  PlaneMeshBuilder,
  OrbitCameraControls,
  MeshMaterialPlugin,
  LightPlugin,
  DirectionalLight,
  Quaternion,
  degToRad,
  AmbientLight,
  TextureType,
  SkyBox,
  UVSphereMeshBuilder,
  LambertMaterial
} from "webgllis"
import { GUI } from "dat.gui"

const canvas = document.createElement('canvas')
const renderDevice = new WebGLRenderDevice(canvas)
const ambientLight = new AmbientLight()
const light = new DirectionalLight()

ambientLight.intensity = 0.15
light.intensity = 1

const renderer = new WebGLRenderer({
  plugins: [
    new LightPlugin(),
    new MeshMaterialPlugin()
  ]
})
const camera = new Camera()
const cameraControls = new OrbitCameraControls(camera, canvas)

// loaders
const textureLoader = new TextureLoader()
const texture = textureLoader.load({
  paths: ["/assets/images/uv.jpg"],
})

//create objects
const material = new LambertMaterial({
  mainTexture: texture
})
const meshBuilder = new PlaneMeshBuilder()
meshBuilder.width = 10
meshBuilder.height = 10

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
const skyBox = new SkyBox({
  day
})
skyBox.transform.orientation.rotateY(Math.PI)
const ground = new MeshMaterial3D(meshBuilder.build(), material)
const objects = createObjects()

ground.transform.orientation.rotateX(-Math.PI / 2)

//set up the camera
cameraControls.distance = 2
if (camera.projection instanceof PerspectiveProjection) {
  camera.projection.fov = Math.PI / 180 * 75
  camera.projection.aspect = innerWidth / innerHeight
}

document.body.append(canvas)
addEventListener("resize", updateView)
updateView()
requestAnimationFrame(update)

function createObjects() {
  const results = []
  const meshBuilder2 = new UVSphereMeshBuilder()
  meshBuilder2.radius = 0.25
  const sphereMesh = meshBuilder2.build()

  for (let x = -5; x < 5; x++) {
    for (let y = -5; y < 5; y++) {
      const object = new MeshMaterial3D(sphereMesh, material)

      object.transform.position.x = x
      object.transform.position.y = 0.5
      object.transform.position.z = y
      results.push(object)
    }
  }

  return results
}

function update() {
  cameraControls.update()
  renderer.render([ground, ...objects, light, ambientLight, skyBox], renderDevice, camera)
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

// gui controls
const settings = {
  x: 0,
  y: 0,
  z: 0,
}
const controls = new GUI()
const buildOptionsFolder = controls.addFolder("Settings")
buildOptionsFolder
  .add(settings, 'x', -360, 360)
  .name("Rotate X")
  .onChange(transformLight)
buildOptionsFolder
  .add(settings, 'y', -360, 360)
  .name("Rotate Y")
  .onChange(transformLight)
buildOptionsFolder
  .add(settings, 'z', -360, 360)
  .name("Rotate Z")
  .onChange(transformLight)
buildOptionsFolder.open()

function transformLight() {
  const quaternion = Quaternion.fromEuler(
    degToRad(settings.x),
    degToRad(settings.y),
    degToRad(settings.z)
  )
  light.transform.orientation.copy(quaternion)
}