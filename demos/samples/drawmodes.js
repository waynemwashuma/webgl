import {
  Mesh,
  BasicMaterial,
  QuadGeometry,
  DrawMode,
  Renderer,
  TextureLoader
} from "webgllis"

/**
 * @param {{renderer:Renderer, textureLoader:TextureLoader}} option 
 */
export function drawModes({renderer}) {
  const geometry1 = new QuadGeometry(1, 1)
  const materials = [
    new BasicMaterial(),
    new BasicMaterial(),
    new BasicMaterial(),
    new BasicMaterial(),
    new BasicMaterial(),
    new BasicMaterial(),
    new BasicMaterial(),
  ]
  materials[0].drawMode = DrawMode.POINTS
  materials[1].drawMode = DrawMode.LINES
  materials[2].drawMode = DrawMode.LINE_LOOP
  materials[3].drawMode = DrawMode.LINE_STRIP
  materials[4].drawMode = DrawMode.TRIANGLES
  materials[5].drawMode = DrawMode.TRIANGLE_STRIP
  materials[6].drawMode = DrawMode.TRIANGLE_FAN

  //create meshes
  const meshes = materials.map(material => new Mesh(geometry1, material))

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
}