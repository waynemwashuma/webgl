import {
  Quaternion,
  SkyBox,
  Vector3
} from 'webgllis';

export function skyBox({
  renderer,
  textureLoader
}) {
  const skyBox = new SkyBox({
    day: textureLoader.get('day'),
    night: textureLoader.get('night'),
  })
  renderer.camera.transform.position.z = 2
  renderer.camera.makePerspective(120)
  renderer.add(skyBox)

  let number = 0, direction = 1
  const interval = 0.001
  const euler = new Vector3(0, Math.PI / 1000, 0)
  const rotation = new Quaternion().setFromEuler(euler)
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