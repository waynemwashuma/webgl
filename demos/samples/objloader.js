import {
  Vector3,
  Quaternion,
  OBJLoader,
  BasicMaterial,
  Renderer,
  TextureLoader,
  PerspectiveProjection
} from 'webgllis';

/**
 * @param {{renderer:Renderer, textureLoader:TextureLoader}} option 
 */
export function objLoader({
  renderer,
  textureLoader
}) {
  const loader = new OBJLoader()
  const texture = textureLoader.load({
    paths: ["assets/models/obj/pirate_girl/pirate_girl.png"]
  })
  loader.load({
    path: "assets/models/obj/pirate_girl/pirate_girl.obj"
  }).then((mesh => {
    renderer.add(mesh)
    const rotation = Quaternion.fromEuler(0, Math.PI / 1000, 0)

    setInterval(() => {
      mesh.transform.orientation.multiply(rotation)

      if (mesh.material instanceof BasicMaterial) {
        mesh.material.mainTexture = texture
      }
    }, 100 / 6)
  }))
  renderer.camera.transform.position.z = 2
  renderer.camera.transform.position.y = 2
  if (renderer.camera.projection instanceof PerspectiveProjection) {
    renderer.camera.projection.fov = Math.PI / 180 * 120
    renderer.camera.projection.aspect = renderer.domElement.width / renderer.domElement.height
  }
}