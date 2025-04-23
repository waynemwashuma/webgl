import {
  Mesh,
  BasicMaterial,
  CircleGeometry,
  BoxGeometry,
  UVSphereGeometry,
  IcosphereGeometry,
  CylinderGeometry,
  QuadGeometry,
  Vector3,
  Quaternion,
  Renderer,
  TextureLoader
} from "webgllis"

/**
 * @param {{renderer:Renderer, textureLoader:TextureLoader}} option 
 */
export function geometries({
  renderer,
  textureLoader
}) {
  const texture = textureLoader.get('uv')
  const material = new BasicMaterial({
    mainTexture:texture
  })
  const geometries = [
    new QuadGeometry(1, 1),
    new CircleGeometry(0.7),
    new BoxGeometry(),
    new UVSphereGeometry(0.7),
    new IcosphereGeometry(0.7),
    new CylinderGeometry(0.7),
  ]

  //create meshes
  const meshes = geometries.map(geometry => new Mesh(geometry, material))

  //transform meshes to thier positions
  meshes.forEach((mesh, i) => {
    const stepX = 1.6
    const stepY = 2
    const startX = -1.6
    const startY = 1.6
    const number = 3

    mesh.transform.position.x = startX + stepX * (i % number)
    mesh.transform.position.y = startY - Math.floor(i / number) * stepY
  })

  //set up the camera
  renderer.camera.transform.position.z = 5
  renderer.camera.makePerspective(120)

  //add meshes to the renderer
  meshes.forEach(mesh => renderer.add(mesh))

  //rotate the meshes
  setInterval(() => {
    const euler = new Vector3(Math.PI / 1000, Math.PI / 1000, 0)
    const quat = new Quaternion().setFromEuler(euler)
    meshes.forEach(mesh => mesh.transform.orientation.multiply(quat))
  }, 1000 / 60)
}