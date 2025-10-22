import {
  WebGLRenderer,
  PerspectiveProjection,
  GLTFLoader,
  Camera,
  Quaternion,
  SkeletonHelper,
  MeshMaterial3D,
  WebGLCanvasSurface
} from 'webgllis';
import { Bone3D } from '../../src/objects/bone.js';

const canvas = document.createElement('canvas')
const surface = new WebGLCanvasSurface(canvas)
const renderer = new WebGLRenderer()
const camera = new Camera()
const objects = []

const loader = new GLTFLoader()
loader.asyncLoad({
  paths: ["assets/models/gltf/pirate_girl/index.gltf"]
}).then((model) => {
  const entityMap = new Map()
  const clone = model.clone(entityMap)

  // NOTE: Maybe make this internal to the loader?
  clone.traverseDFS((object) => {
    if (object instanceof MeshMaterial3D && object.skin) {
      object.skin.bones = object.skin.bones.map((bone) => entityMap.get(bone))
    }
    return true
  })
  objects.push(clone)
  clone.traverseDFS((item) => {
    if (item instanceof MeshMaterial3D && item.skin) {
      const root = item.skin.bones[0]
      if (root instanceof Bone3D) {
        const helper = new SkeletonHelper(root, item)

        objects.push(helper)
        return false
      }
    }
    return true
  })
})

camera.transform.position.z = 5
camera.transform.position.y = 2
if (camera.projection instanceof PerspectiveProjection) {
  camera.projection.fov = Math.PI / 180 * 120
  camera.projection.aspect = innerWidth / innerHeight
}
const rotation = Quaternion.fromEuler(0, Math.PI / 1000, 0)

document.body.append(canvas)
updateView()
addEventListener("resize", updateView)
requestAnimationFrame(update)

function update() {
  if (objects[0]) {
    objects[0].traverseDFS((mesh)=>{
      if(mesh instanceof MeshMaterial3D){
        mesh.transform.orientation.multiply(rotation)
      }
      return true
    })

    objects[0].traverseDFS((bone)=>{
      if(bone instanceof Bone3D){
        if(
          bone.name === 'metarig.001_thigh.L' ||
          bone.name === 'metarig.001_shin.L'
        ){
          bone.transform.orientation.multiply(Quaternion.fromEuler(Math.PI / 120,0, 0))
        }

        if(
          bone.name === 'metarig.001_thigh.R' ||
          bone.name === 'metarig.001_shin.R'
        ){
          bone.transform.orientation.multiply(Quaternion.fromEuler(-Math.PI / 120,0, 0))
        }
      }
      return true
    })
  }

  if (objects.length > 0) {
    renderer.render(objects, surface, camera)
  }
  requestAnimationFrame(update)
}

function updateView() {
  canvas.style.width = innerWidth + "px"
  canvas.style.height = innerHeight + "px"
  canvas.width = innerWidth * devicePixelRatio
  canvas.height = innerHeight * devicePixelRatio

  if (camera.projection instanceof PerspectiveProjection) {
    camera.projection.aspect = innerWidth / innerHeight
  }
}