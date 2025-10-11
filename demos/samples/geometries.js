import {
  MeshMaterial3D,
  BasicMaterial,
  CircleGeometry,
  BoxGeometry,
  UVSphereGeometry,
  IcosphereGeometry,
  CylinderGeometry,
  QuadGeometry,
  Quaternion,
  Renderer,
  TextureLoader,
  PerspectiveProjection
} from "webgllis"

/**
 * @param {{renderer:Renderer}} option 
 */
export function geometries({
  renderer
}) {
  const textureLoader = new TextureLoader()
  const texture = textureLoader.load({
    paths: ["./assets/uv.jpg"]
  })
  const material = new BasicMaterial({
    mainTexture: texture
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
  const meshes = geometries.map(geometry => new MeshMaterial3D(geometry, material))

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
  if (renderer.camera.projection instanceof PerspectiveProjection) {
    renderer.camera.projection.fov = Math.PI / 180 * 120
    renderer.camera.projection.aspect = renderer.domElement.width / renderer.domElement.height
  }

  //add meshes to the renderer
  meshes.forEach(mesh => renderer.add(mesh))

  const rotation = Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)

  //rotate the meshes
  setInterval(() => {
    meshes.forEach(mesh => mesh.transform.orientation.multiply(rotation))
  }, 1000 / 60)
}