import {
  Renderer,
  TextureLoader,
  PerspectiveProjection,
  GLTFLoader
} from 'webgllis';

/**
 * @param {{renderer:Renderer, textureLoader:TextureLoader}} option 
 */
export function gltfLoader({
  renderer
}) {
  const loader = new GLTFLoader()
  loader.asyncLoad({
    path: "assets/models/gltf/pirate_girl/index.gltf",
    name: "object"
  }).then((group)=>{
    const renderable = group.clone()
    
    renderer.add(renderable)
  })

  renderer.camera.transform.position.z = 2
  renderer.camera.transform.position.y = 2
  if (renderer.camera.projection instanceof PerspectiveProjection) {
    renderer.camera.projection.fov = Math.PI / 180 * 120
    renderer.camera.projection.aspect = renderer.domElement.width / renderer.domElement.height
  }
}