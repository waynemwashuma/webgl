import {
  Mesh,
  Texture,
  LambertMaterial,
  BoxGeometry,
  Vector3,
  Quaternion,
  Color
} from 'webgllis';

export function rotatingCube({
  renderer,
  textureLoader
}) {
  const tex = textureLoader.get('uv')
  const origin = new Mesh(
    new BoxGeometry(1, 1, 1),
    new LambertMaterial({
      mainTexture: tex,
      lightDir: new Vector3(0, -3, -3),
      specularShininess: 4,
      specularStrength: 0.06,
      diffuseIntensity: 0.1
    })
  )
  renderer.camera.transform.position.z = 2
  renderer.camera.makePerspective(120)
  renderer.add(origin)

  const euler = new Vector3(Math.PI / 1000, Math.PI / 1000, 0)
  const quat1 = new Quaternion().setFromEuler(euler)
  setInterval(() => {
    origin.transform.orientation.multiply(quat1)
  }, 100 / 6)
}