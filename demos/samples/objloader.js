import {
  OBJLoader,
  BasicMaterial,
  Renderer,
  TextureLoader,
  PerspectiveProjection
} from 'webgllis';

const canvas = document.createElement('canvas')
const renderer = new Renderer(canvas)

document.body.append(canvas)
renderer.setViewport(innerWidth, innerHeight)
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
renderer.camera.transform.position.z = 2
renderer.camera.transform.position.y = 2
if (renderer.camera.projection instanceof PerspectiveProjection) {
  renderer.camera.projection.fov = Math.PI / 180 * 120
  renderer.camera.projection.aspect = renderer.domElement.width / renderer.domElement.height
}

requestAnimationFrame(update)

function update() {
  renderer.render(objects)

  requestAnimationFrame(update)
}

addEventListener("resize", () => {
  renderer.setViewport(innerWidth, innerHeight)

  if (renderer.camera.projection instanceof PerspectiveProjection) {

    renderer.camera.projection.aspect = innerWidth / innerHeight
  }
})