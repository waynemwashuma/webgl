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
  AmbientLight,
  TextureType,
  SkyBox,
  UVSphereMeshBuilder,
  LambertMaterial,
  PointLight,
  BasicMaterial,
  Color,
  PhongMaterial,
  StandardMaterial,
  CanvasTarget,
  SkyboxPlugin,
  ShadowPlugin,
  SpotLightShadow,
  CameraPlugin
} from "webgllis"
import { GUI } from "dat.gui"

const canvas = document.createElement('canvas')
const renderTarget = new CanvasTarget(canvas)
const renderDevice = new WebGLRenderDevice(canvas, {
  depth: true
})
const renderer = new WebGLRenderer({
  plugins: [
    new ShadowPlugin(),
    new LightPlugin(),
    new SkyboxPlugin(),
    new MeshMaterialPlugin(),
    new CameraPlugin()
  ]
})

// assets and loaders
const textureLoader = new TextureLoader()
const texture = textureLoader.load({
  paths: ["/assets/images/uv.jpg"],
})
/**@type {[LambertMaterial, PhongMaterial,StandardMaterial]} */
const materials = [
  new LambertMaterial({
    mainTexture: texture
  }),
  new PhongMaterial({
    mainTexture: texture
  }),
  new StandardMaterial({
    mainTexture: texture,
    roughness: 0.4,
    metallic: 0
  })
]
const meshBuilder = new PlaneMeshBuilder()
const lightMeshBuilder = new UVSphereMeshBuilder()
const environmentTexture = textureLoader.load({
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

lightMeshBuilder.radius = 0.1
meshBuilder.width = 10
meshBuilder.height = 10

// objects
const ambientLight = new AmbientLight()
const shadow = new SpotLightShadow()
const light = new PointLight()
const camera = new Camera(renderTarget)
const cameraControls = new OrbitCameraControls(camera, canvas)
const skyBox = new SkyBox({
  day: environmentTexture
})
const ground = new MeshMaterial3D(meshBuilder.build(), materials[0])
const objects = createObjects()
const lightHelper = new MeshMaterial3D(lightMeshBuilder.build(), new BasicMaterial({
  color: new Color(1, 0, 0)
}))

light.intensity = 1
light.shadow = shadow
light.radius = 5
light.add(lightHelper)
light.transform.position.y = 1
ambientLight.intensity = 0.15
skyBox.transform.orientation.rotateY(Math.PI)
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
      const object = new MeshMaterial3D(sphereMesh, materials[0])

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
  renderer.render([ground, ...objects, light, ambientLight, skyBox, camera], renderDevice)
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
const options = [
  'LAMBERT',
  'PHONG',
  'STANDARD'
]
const settings = {
  x: light.transform.position.x,
  y: light.transform.position.y,
  z: light.transform.position.z,
  color: {
    r: 0,
    g: 0,
    b: 0
  },
  material: options[0],
  shadow: true
}

const controls = new GUI()
const lightFolder = controls.addFolder("Light")
const shadowFolder = controls.addFolder("Shadow")
lightFolder
  .add(light.transform.position, 'x', -10, 10)
  .name("Translate X")
lightFolder
  .add(light.transform.position, 'y', 0, 2)
  .name("Translate Y")
lightFolder
  .add(light.transform.position, 'z', -10, 10)
  .name("Translate Z")
lightFolder
  .add(light, 'intensity', 0, 100)
  .name("Intensity")
lightFolder
  .add(light, 'radius', 0, 10)
  .name("Falloff Radius")
lightFolder
  .add(light, 'decay', 0, 100)
  .name("Decay")
lightFolder
  .add(settings, 'material', options)
  .name("Material")
  .onChange(changeMaterial)
lightFolder
  .addColor(settings, 'color')
  .name('Color')
  .onChange((value) => {
    light.color.set(
      value.r / 255,
      value.g / 255,
      value.b / 255
    )
  })
shadowFolder
  .add(settings, 'shadow')
  .name("Enable Shadow")
  .onChange(toggleShadows)
shadowFolder
  .add(shadow, 'near', 0.01, 1)
  .name('Near')
shadowFolder
  .add(shadow, 'bias', 0, 1)
  .name('Bias')
shadowFolder
  .add(shadow, 'normalBias', 0, 0.005)
  .name('Normal Bias')

shadowFolder.open()
lightFolder.open()
/**
 * @param {string} value
 */
function changeMaterial(value) {
  switch (value) {
    case options[0]:
      objects.forEach((o) => o.material = materials[0])
      ground.material = materials[0]
      break;
    case options[1]:
      objects.forEach((o) => o.material = materials[1])
      ground.material = materials[1]
      break;
    case options[2]:
      objects.forEach((o) => o.material = materials[2])
      ground.material = materials[2]
      break;
    default:
      break;
  }
}

/**
 * @param {boolean} value
 */
function toggleShadows(value) {
  if (value) {
    light.shadow = shadow
  } else {
    light.shadow = undefined
  }
}