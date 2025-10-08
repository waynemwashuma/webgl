import {
  MeshMaterial3D,
  LambertMaterial,
  BoxGeometry,
  Vector3,
  Quaternion,
  DirectionalLight,
  Renderer,
  TextureLoader,
  BasicMaterial,
  PerspectiveProjection
} from 'webgllis';

/**
 * @param {{renderer:Renderer, textureLoader:TextureLoader}} option 
 */
export function transformPropagation({
  renderer,
  textureLoader
}) {
  const light = new DirectionalLight()
  light.direction.set(0,-1,-1).normalize()
  renderer.lights.ambientLight.intensity = 0.15
  renderer.lights.directionalLights.add(light)
  
  const tex = textureLoader.get('uv')
  const geometry = new BoxGeometry(0.5, 0.5, 0.5)
  const material = new BasicMaterial({
    mainTexture: tex
  })
  const parent = new MeshMaterial3D(geometry,material)
  const child = new MeshMaterial3D(geometry,material)

  child.transform.position.x = 1
  renderer.camera.transform.position.z = 2
  if(renderer.camera.projection instanceof PerspectiveProjection){
    renderer.camera.projection.fov = Math.PI / 180 * 120
    renderer.camera.projection.aspect = renderer.domElement.width / renderer.domElement.height
  }
  parent.add(child)
  renderer.add(parent)
  
  const quat1 = Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)
  setInterval(() => {
    parent.transform.orientation.multiply(quat1)
    
  }, 100 / 6)
}