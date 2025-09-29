import {
  Mesh,
  Texture,
  LambertMaterial,
  UVSphereGeometry,
  Vector3,
  Quaternion,
  Color,
  DrawMode,
  DirectionalLight
} from 'webgllis';

export function rotatingUvSphere({
  renderer,
  textureLoader
}) {
  const tex = textureLoader.get('uv')
  const light = new DirectionalLight()
  light.direction.set(0, -1, -1).normalize()
  renderer.lights.ambientLight.intensity = 0.15
  renderer.lights.directionalLights.add(light)
  
  const origin = new Mesh(
    new UVSphereGeometry(1),
    new LambertMaterial({
      mainTexture: tex,
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