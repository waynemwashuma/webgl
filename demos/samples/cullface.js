import {
  Mesh,
  BasicMaterial,
  QuadGeometry,
  Quaternion,
  CullFace,
  Renderer,
  TextureLoader,
  PerspectiveProjection
} from "webgllis"

/**
 * @param {{renderer:Renderer, textureLoader:TextureLoader}} option 
 */
export function cullface({
  renderer,
  textureLoader
}) {
  const tex = textureLoader.get('uv')
  const geometry = new QuadGeometry(1, 1)
  const materials = [
    new BasicMaterial({
      mainTexture: tex
    }),
    new BasicMaterial({
      mainTexture: tex
    }),
    new BasicMaterial({
      mainTexture: tex
    }),
    new BasicMaterial({
      mainTexture: tex
    })
  ]

  materials[0].cullFace = CullFace.NONE
  materials[1].cullFace = CullFace.FRONT
  materials[2].cullFace = CullFace.BACK
  materials[3].cullFace = CullFace.BOTH
  
  //create meshes
  const meshes = materials.map(material => new Mesh(geometry, material))

  //transform meshes to their positions
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

  const rotation = Quaternion.fromEuler(Math.PI / 1000, Math.PI / 1000, 0)

  //rotate the meshes at 60 fps
  setInterval(() => {
    meshes.forEach(mesh => mesh.transform.orientation.multiply(rotation))
  })
}