import {
  Mesh,
  BasicMaterial,
  LambertMaterial,
  PhongMaterial,
  BoxGeometry,
  UVSphereGeometry,
  Vector3,
  Quaternion,
  Color
} from "webgllis"

export function materials({renderer}) {
  renderer.lights.ambientLight.intensity = 0.15
  const geometry1 = new BoxGeometry(1, 1)
  const geometry2 = new UVSphereGeometry(0.7)
  const materials = [
    new BasicMaterial(),
    new LambertMaterial({
      lightDir: new Vector3(0, -1, -1).normalize(),
      specularShininess: 4,
      specularStrength: 0.6,
      diffuseIntensity: 1
    }),
    new PhongMaterial({
      lightDir: new Vector3(-1, -1, -1).normalize(),
      specularShininess: 3,
      specularStrength: 2,
      diffuseIntensity: 0.1
    })
  ]

  //create meshes
  const meshes = materials.map(material => new Mesh(geometry1, material))
    .concat(materials.map(material => new Mesh(geometry2, material)))

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

  //rotate the meshes at 60 fps
  setInterval(() => {
    const euler = new Vector3(Math.PI / 1000, Math.PI / 1000, 0)
    const quat = new Quaternion().setFromEuler(euler)
    meshes.forEach(mesh => mesh.transform.orientation.multiply(quat))
  })
}