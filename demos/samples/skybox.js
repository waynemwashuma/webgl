import {
  PerspectiveProjection,
  Quaternion,
  Renderer,
  SkyBox,
  TextureLoader,
  Vector3
} from 'webgllis';

/**
 * @param {{renderer:Renderer, textureLoader:TextureLoader}} option 
 */
export function skyBox({
  renderer,
  textureLoader
}) {
  const skyBox = new SkyBox({
    day: textureLoader.get('day'),
    night: textureLoader.get('night'),
  })
  renderer.camera.transform.position.z = 2
  if(renderer.camera.projection instanceof PerspectiveProjection){
    renderer.camera.projection.fov = Math.PI / 180 * 120
    renderer.camera.projection.aspect = renderer.domElement.width / renderer.domElement.height
  }
  renderer.add(skyBox)

  let number = 0, direction = 1
  const interval = 0.001
  const rotation = Quaternion.fromEuler(0, Math.PI / 1000, 0)
  setInterval(() => {
    skyBox.material.lerp = number

    const next = number + interval * direction
    if (number > 1 || number < 0) {
      direction *= -1
      if(direction === -1){
        number = 1
      }else {
        number = 0
      }
    } else {
      number = next
    }

    renderer.camera.transform.orientation.multiply(rotation)
  })
}