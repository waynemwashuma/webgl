import {
  Mesh,
  LambertMaterial,
  BoxGeometry,
  Quaternion,
  DirectionalLight,
  Renderer,
  TextureLoader,
  PerspectiveProjection
} from 'webgllis';

/**
 * @param {{renderer:Renderer, textureLoader:TextureLoader}} option 
 */
export function rotatingCube({
  renderer,
  textureLoader
}) {
  const light = new DirectionalLight()
  light.direction.set(0, -1, -1).normalize()
  renderer.lights.ambientLight.intensity = 0.15
  renderer.lights.directionalLights.add(light)

  const tex = textureLoader.get('uv')
  const origin = new Mesh(
    new BoxGeometry(1, 1, 1),
    new LambertMaterial({
      mainTexture: tex
    })
  )
  renderer.camera.transform.position.z = 2
  if (renderer.camera.projection instanceof PerspectiveProjection) {
    renderer.camera.projection.fov = Math.PI / 180 * 120
    renderer.camera.projection.aspect = renderer.domElement.width / renderer.domElement.height
  }
  renderer.add(origin)

  const rotation = Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)

  setInterval(() => {
    origin.transform.orientation.multiply(rotation)
  }, 100 / 6)
}