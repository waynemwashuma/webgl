import {
  MeshMaterial3D,
  BasicMaterial,
  Quaternion,
  WebGLRenderer,
  TextureLoader,
  PerspectiveProjection,
  Camera,
  WebGLCanvasSurface,
  PlaneMeshBuilder,
  Circle3DMeshBuilder,
  CuboidMeshBuilder,
  UVSphereMeshBuilder,
  CylinderMeshBuilder,
  MeshMaterialPlugin
} from "webgllis"

const canvas = document.createElement('canvas')
const surface = new WebGLCanvasSurface(canvas)
const renderer = new WebGLRenderer({
  plugins:[
    new MeshMaterialPlugin()
  ]
})
const camera = new Camera()

const textureLoader = new TextureLoader()
const texture = textureLoader.load({
  paths: ["/assets/images/uv.jpg"],
  textureSettings:{
    flipY:true
  }
})
const material = new BasicMaterial({
  mainTexture: texture
})

const meshes = [
  new PlaneMeshBuilder().build(),
  new Circle3DMeshBuilder().build(),
  new CuboidMeshBuilder(). build(),
  new UVSphereMeshBuilder().build(),
  new CylinderMeshBuilder().build(),
]

//create objects
const objects = meshes.map(mesh => new MeshMaterial3D(mesh, material))

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

//set up the camera
camera.transform.position.z = 5
if (camera.projection instanceof PerspectiveProjection) {
  camera.projection.fov = Math.PI / 180 * 120
  camera.projection.aspect = innerWidth / innerHeight
}


const rotation = Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)

document.body.append(canvas)
addEventListener("resize", updateView)
updateView()
requestAnimationFrame(update)

function update() {
  objects.forEach(object => object.transform.orientation.multiply(rotation))
  
  renderer.render(objects,surface, camera)
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