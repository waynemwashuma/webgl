import {
  OBJLoader,
  BasicMaterial,
  Renderer,
  TextureLoader,
  PerspectiveProjection,
  Camera,
  Quaternion,
  MeshMaterial3D,
  LambertMaterial,
  PhongMaterial
} from 'webgllis';

const canvas = document.createElement('canvas')
const renderer = new Renderer(canvas)
const camera = new Camera()

document.body.append(canvas)
renderer.setViewport(innerWidth, innerHeight)

const textureLoader = new TextureLoader()
const loader = new OBJLoader()
const texture = textureLoader.load({
  paths: ["assets/models/obj/pirate_girl/pirate_girl.png"],
  textureSettings:{
    flipY:true
  }
})
const model = loader.load({
  paths: ["assets/models/obj/pirate_girl/pirate_girl.obj"],
  postprocessor:(asset)=>{
    asset.traverseDFS((object)=>{
      if (object instanceof MeshMaterial3D) {
        if(
          object.material instanceof BasicMaterial ||
          object.material instanceof LambertMaterial ||
          object.material instanceof PhongMaterial
        ){
          object.material.mainTexture = texture
        }
      }
      return true
    })
  }
})
camera.transform.position.z = 2
camera.transform.position.y = 2
if (camera.projection instanceof PerspectiveProjection) {
  camera.projection.fov = Math.PI / 180 * 120
  camera.projection.aspect = innerWidth / innerHeight
}

const rotation = Quaternion.fromEuler(0, Math.PI / 1000, 0)
requestAnimationFrame(update)

function update() {
  model.transform.orientation.multiply(rotation)
  renderer.render([model], camera)

  requestAnimationFrame(update)
}

addEventListener("resize", () => {
  renderer.setViewport(innerWidth, innerHeight)

  if (camera.projection instanceof PerspectiveProjection) {

    camera.projection.aspect = innerWidth / innerHeight
  }
})