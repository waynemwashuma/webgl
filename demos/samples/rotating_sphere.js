import {
  Mesh,
  Texture,
  BasicMaterial,
  UVSphereGeometry,
  Vector3,
  Quaternion,
  Color,
  DrawMode
} from 'webgllis';

export function rotatingUvSphere({
  renderer,
  textureLoader
}) {
  const origin = new Mesh(
    new UVSphereGeometry(1),
    new BasicMaterial({
      color:new Color(1,1,1,1)
    })
  )
  renderer.camera.transform.position.z = 2
  renderer.camera.makePerspective(120)
  renderer.add(origin)

  const euler = new Vector3(Math.PI / 1000,Math.PI / 1000, 0)
  const quat1 = new Quaternion().setFromEuler(euler)
  setInterval(() => {
    origin.transform.orientation.multiply(quat1)
  }, 100 / 6)
}