import {
  Mesh,
  BasicMaterial,
  QuadGeometry,
  PrimitiveTopology,
  Renderer,
  TextureLoader,
  PerspectiveProjection
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
  materials[0].drawMode = PrimitiveTopology.Points
  materials[1].drawMode = PrimitiveTopology.Lines
  materials[2].drawMode = PrimitiveTopology.LineLoop
  materials[3].drawMode = PrimitiveTopology.LineStrip
  materials[4].drawMode = PrimitiveTopology.Triangles
  materials[5].drawMode = PrimitiveTopology.TriangleStrip
  materials[6].drawMode = PrimitiveTopology.TriangleFan

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
  if(renderer.camera.projection instanceof PerspectiveProjection){
    renderer.camera.projection.fov = Math.PI / 180 * 120
    renderer.camera.projection.aspect = renderer.domElement.width / renderer.domElement.height
  }

  //add meshes to the renderer
  meshes.forEach(mesh => renderer.add(mesh))
}