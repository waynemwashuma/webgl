import { PrimitiveTopology, TextureFormat } from "../../constant.js";
import { MeshVertexLayout, Shader, VertexBufferLayout } from "../../core/index.js";
import { Material } from "../../material/index.js";
import { Affine3 } from "../../math/index.js";
import { Mesh } from "../../mesh/index.js";
import { WebGLRenderer } from "../../renderer/renderer.js";
import { skeletonFragment, skeletonVertex } from "../../shader/index.js";
import { Texture } from "../../texture/index.js";
import { Bone3D } from "../bone.js";
import { MeshMaterial3D } from "../mesh.js";

// TODO: Move these global state to corresponding plugin when the plugin system lands
let pipelineid

// This needs to extend `MeshMaterial3D` as currently no support for a plugin system in the renderer
/**
 * @class
 */
export class SkeletonHelper extends MeshMaterial3D {
  /**
   * @type {Bone3D}
   */
  rootBone

  /**
   * @type {MeshMaterial3D}
   */
  skinnedMesh
  /**
   * @param {Bone3D} rootBone
   * @param {MeshMaterial3D} skinnedMesh
   */
  constructor(rootBone, skinnedMesh) {
    super(new Mesh(), new Material())
    this.rootBone = rootBone
    this.skinnedMesh = skinnedMesh
  }

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLRenderer} renderer
   */
  renderGL(gl, renderer) {
    const { caches } = renderer
    if (!this.skinnedMesh.skin) {
      console.warn("The provided object does not have a skin")
      return
    }
    const { bones, boneTexture } = this.skinnedMesh.skin
    const pipeline = getRenderPipeline(gl, renderer)
    const transformsInfo = pipeline.uniforms.get("transforms")
    const modelInfo = pipeline.uniforms.get("model")
    const parentInfo = pipeline.uniforms.get("parent_index")
    const childInfo = pipeline.uniforms.get("child_index")

    pipeline.use(gl)

    if (
      !transformsInfo ||
      !parentInfo || !childInfo) {
      throw "uniforms are not set up correctly in shader"
    }

    updateDataTexture(boneTexture, bones.map((bone) => bone.transform.world))

    const transformsTexture = caches.getTexture(gl, boneTexture)

    gl.activeTexture(gl.TEXTURE0 + transformsInfo.texture_unit)
    gl.bindTexture(boneTexture.type, transformsTexture)
    
    gl.uniformMatrix4fv(modelInfo.location, false, [...Affine3.toMatrix4(this.skinnedMesh.transform.world)])
    gl.bindVertexArray(null)
    
    this.rootBone.traverseBFS((parent) => {
      if (parent instanceof Bone3D) {
        for (let i = 0; i < parent.children.length; i++) {
          const child = parent.children[i]
          if (child instanceof Bone3D) {
            const childIndex = child.index
            const parentIndex = parent.index
            gl.uniform1ui(parentInfo.location, parentIndex)
            gl.uniform1ui(childInfo.location, childIndex)
            gl.drawArrays(PrimitiveTopology.Lines, 0, 2)
          }
        }
      }
      return true
    })
  }
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLRenderer} renderer
 */
function getRenderPipeline(gl, renderer) {
  const { caches, includes, defines: globalDefines } = renderer
  if (pipelineid) {
    const pipeline = caches.getRenderPipeline(pipelineid)

    if (pipeline) {
      return pipeline
    }
  }

  /**
   * @type {import("../../core/index.js").WebGLRenderPipelineDescriptor}
   */
  const descriptor = {
    depthWrite: false,
    depthTest: false,
    topology: PrimitiveTopology.Lines,
    // TODO: Actually implement this to use the mesh
    vertexLayout: new MeshVertexLayout([]),
    vertex: new Shader({
      source: skeletonVertex
    }),
    fragment: {
      source: new Shader({
        source: skeletonFragment
      }),
      targets: [{
        format: TextureFormat.RGBA8Unorm
      }]
    }
  }

  for (const [name, value] of globalDefines) {
    descriptor.vertex.defines.set(name, value)
    descriptor.fragment?.source?.defines?.set(name, value)
  }
  for (const [name, value] of includes) {
    descriptor.vertex.includes.set(name, value)
    descriptor.fragment?.source?.includes?.set(name, value)
  }
  const [newRenderPipeline, newId] = caches.createRenderPipeline(gl, descriptor)

  pipelineid = newId
  return newRenderPipeline
}

// NOTE: This could be expanded to pack numbers, vectors, matrices and affines
/**
 * @param {Texture} texture
 * @param {Affine3[]} items
 */
function updateDataTexture(texture, items) {
  const data = new Float32Array(items.length * 16)

  for (let i = 0; i < items.length; i++) {
    const offset = i * 16
    const world = items[i]

    data[offset + 0] = world.a
    data[offset + 1] = world.b
    data[offset + 2] = world.c
    data[offset + 3] = 0
    data[offset + 4] = world.d
    data[offset + 5] = world.e
    data[offset + 6] = world.f
    data[offset + 7] = 0
    data[offset + 8] = world.g
    data[offset + 9] = world.h
    data[offset + 10] = world.i
    data[offset + 11] = 0
    data[offset + 12] = world.x
    data[offset + 13] = world.y
    data[offset + 14] = world.z
    data[offset + 15] = 1
  }

  // TODO: Use the entire dimensions of the texture to pack values
  texture.width = 4
  texture.height = items.length
  texture.data = data.buffer
  texture.update()
}
