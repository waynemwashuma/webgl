import {
  OBJLoader,
  BasicMaterial,
  Renderer,
  TextureLoader,
  PerspectiveProjection,
  Camera,
  Object3D
} from 'webgllis';

const canvas = document.createElement('canvas')
const renderer = new Renderer(canvas)
const camera = new Camera()

document.body.append(canvas)
renderer.setViewport(innerWidth, innerHeight)
/**
 * @type {Object3D[]}
 */
const objects = []
const textureLoader = new TextureLoader()
const loader = new OBJLoader()
const texture = textureLoader.load({
  paths: ["assets/models/obj/pirate_girl/pirate_girl.png"],
  textureSettings:{
    flipY:true
  }
})
loader.load({
  path: "assets/models/obj/pirate_girl/pirate_girl.obj"
}).then((object => {
  const clone = object.clone()

  if(clone.material instanceof BasicMaterial){
    clone.material.mainTexture = texture
  }
  objects.push(clone)
}))
camera.transform.position.z = 2
camera.transform.position.y = 2
if (camera.projection instanceof PerspectiveProjection) {
  camera.projection.fov = Math.PI / 180 * 120
  camera.projection.aspect = innerWidth / innerHeight
}

requestAnimationFrame(update)

function update() {
  renderer.render(objects, camera)

  requestAnimationFrame(update)
}

addEventListener("resize", () => {
  renderer.setViewport(innerWidth, innerHeight)

  if (camera.projection instanceof PerspectiveProjection) {

    camera.projection.aspect = innerWidth / innerHeight
  }
})