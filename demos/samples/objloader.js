import {
  Vector3,
  Quaternion,
  OBJLoader
} from 'webgllis';

export function objLoader({
  renderer
}) {
  const loader = new OBJLoader()

  loader.load({
    path: "assets/models/obj/pirate_girl/pirate_girl.obj"
  }).then((mesh => {
    renderer.add(mesh)
    const euler = new Vector3(0, Math.PI / 1000, 0)
    const quat1 = new Quaternion().setFromEuler(euler)
    setInterval(() => {
      mesh.transform.orientation.multiply(quat1)
    }, 100 / 6)
  }))
  renderer.camera.transform.position.z = 2
  renderer.camera.transform.position.y = 2
  renderer.camera.makePerspective(120)
}