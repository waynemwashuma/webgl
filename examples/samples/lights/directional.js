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
  ShadowPlugin,
  LightPlugin,
  DirectionalLight,
  Quaternion,
  degToRad,
  AmbientLight,
  TextureType,
  SkyBox,
  UVSphereMeshBuilder,
  CanvasTarget,
  OrthographicShadow,
  CuboidMeshBuilder,
  BasicMaterial,
  Color,
  LambertMaterial
} from "webgllis"
import { GUI } from "dat.gui"

const canvas = document.createElement('canvas')
const renderTarget = new CanvasTarget(canvas)
const renderDevice = new WebGLRenderDevice(canvas,{
  depth:true
})
const renderer = new WebGLRenderer({
  plugins: [
    new ShadowPlugin(),
    new LightPlugin(),
    new MeshMaterialPlugin()
  ]
})

// assets and loaders
const textureLoader = new TextureLoader()
const texture = textureLoader.load({
  paths: ["/assets/images/uv.jpg"],
})
const skyboxTexture = textureLoader.load({
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
const material = new LambertMaterial({
  mainTexture:texture
})
const arrowBuilder = new CuboidMeshBuilder()
const meshBuilder = new PlaneMeshBuilder()

meshBuilder.width = 10
meshBuilder.height = 10
arrowBuilder.width = 0.1
arrowBuilder.height = 0.1
arrowBuilder.depth = 1

// objects
const ambientLight = new AmbientLight()
const sun = new DirectionalLight()
const shadow = new OrthographicShadow()
const camera = new Camera(renderTarget)
const cameraControls = new OrbitCameraControls(camera, canvas)
const lightHelper = new MeshMaterial3D(arrowBuilder.build(), new BasicMaterial({
  color: Color.RED.clone()
}))
const skyBox = new SkyBox({
  day: skyboxTexture
})
const ground = new MeshMaterial3D(meshBuilder.build(), material)
const objects = createObjects()

ambientLight.intensity = 0.15
sun.transform.position.y = 2
sun.transform.position.z = 0
sun.transform.orientation.rotateX(- Math.PI / 2)
sun.intensity = 1
sun.shadow = shadow
shadow.projection.top = 10
shadow.projection.bottom = -10
shadow.projection.left = -10
shadow.projection.right = 10
shadow.bias = 0.002
shadow.far = 20
lightHelper.transform.position.z -= 0.5
sun.add(lightHelper)

skyBox.transform.orientation.rotateY(Math.PI)
ground.transform.orientation.rotateX(-Math.PI / 2)

//set up the camera
cameraControls.distance = 3
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
  renderer.render([ground, ...objects, sun, ambientLight, skyBox], renderDevice, camera)
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
  x: -90,
  y: 0,
  z: 0,
  shadow: true,
  shadowWidth: 20,
  shadowHeight: 20,
}
const controls = new GUI()
const lightFolder = controls.addFolder("Light")
const shadowFolder = controls.addFolder("Shadows")

lightFolder
  .add(sun.transform.position, 'x', -10, 10)
  .name("Translate X")
lightFolder
  .add(sun.transform.position, 'y', -10, 10)
  .name("Translate Y")
lightFolder
  .add(sun.transform.position, 'z', -10, 10)
  .name("Translate Z")
lightFolder
  .add(settings, 'x', -360, 360)
  .name("Rotate X")
  .onChange(transformLight)
lightFolder
  .add(settings, 'y', -360, 360)
  .name("Rotate Y")
  .onChange(transformLight)
lightFolder
  .add(settings, 'z', -360, 360)
  .name("Rotate Z")
  .onChange(transformLight)

shadowFolder
  .add(settings, 'shadow')
  .name("Enable Shadow")
  .onChange(toggleShadows)
shadowFolder
  .add(settings, 'shadowWidth', 1, 20)
  .name('Width')
  .onChange(updateShadowWidth)
shadowFolder
  .add(settings, 'shadowHeight', 1, 20)
  .name('Height')
  .onChange(updateShadowHeight)
shadowFolder
  .add(shadow, 'near', 0.1, 1)
  .name('Near')
shadowFolder
  .add(shadow, 'far', 1, 100)
  .name('Far')
shadowFolder
  .add(shadow, 'bias', 0, 0.01)
  .name('Bias')
shadowFolder
  .add(shadow, 'normalBias', 0, 0.005)
  .name('Normal Bias')
lightFolder.open()
shadowFolder.open()

function transformLight() {
  const quaternion = Quaternion.fromEuler(
    degToRad(settings.x),
    degToRad(settings.y),
    degToRad(settings.z)
  )
  sun.transform.orientation.copy(quaternion)
}

/**
 * @param {number} value
 */
function updateShadowWidth(value){
  shadow.projection.left = -value / 2
  shadow.projection.right = value / 2
}

/**
 * @param {number} value
 */
function updateShadowHeight(value){
  shadow.projection.top = value / 2
  shadow.projection.bottom = -value / 2
}

/**
 * @param {boolean} value
 */
function toggleShadows(value) {
  if (value) {
    sun.shadow = shadow
  } else {
    sun.shadow = undefined
  }
}