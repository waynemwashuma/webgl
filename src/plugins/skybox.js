/**@import { WebGLRenderPipelineDescriptor } from '../core/index.js' */
import { CompareFunction, MeshVertexLayout, Shader, WebGLRenderDevice } from "../core/index.js";
import { Affine3 } from "../math/index.js";
import { CullFace, PrimitiveTopology, TextureFilter, TextureFormat } from "../constants/index.js";
import { Object3D, SkyBox } from "../objects/index.js";
import { Plugin, WebGLRenderer } from "../renderer/index.js";
import { skyboxFragment, skyboxVertex } from "../shader/index.js";
import { CuboidMeshBuilder, Mesh } from "../mesh/index.js";
import { Sampler, Texture } from "../texture/index.js";

export class SkyboxPlugin extends Plugin {

  /**
   * @type {Mesh}
   */
  cube

  constructor() {
    super()

    const cuboid = new CuboidMeshBuilder()
    cuboid.width = 1
    cuboid.height = 1
    cuboid.depth = 1

    this.cube = cuboid.build()
  }
  /**
   * @override
   */
  init() { }

  /**
   * @override
   */
  preprocess() { }

  /**
   * @type {number | undefined}
   */
  pipelineId
  /**
   * @override
   * @param {Object3D} object
   * @param {WebGLRenderDevice} device
   * @param {WebGLRenderer} renderer
   */
  renderObject3D(object, device, renderer) {
    if (!(object instanceof SkyBox)) {
      return
    }
    const { caches } = renderer
    const gpuMesh = caches.getMesh(device, this.cube, renderer.attributes)
    const pipeline = this.getRenderPipeline(device, renderer)
    const modelInfo = pipeline.uniforms.get("model")
    const dayInfo = pipeline.uniforms.get("day")
    const nightInfo = pipeline.uniforms.get("night")
    const lerpInfo = pipeline.uniforms.get("lerp")

    pipeline.use(device.context)

    if (modelInfo) {
      const modeldata = new Float32Array([...Affine3.toMatrix4(object.transform.world)])

      device.context.uniformMatrix4fv(modelInfo.location, false, modeldata)
    }

    if (object.day && dayInfo && dayInfo.texture_unit !== undefined) {
      device.context.activeTexture(WebGL2RenderingContext.TEXTURE0 + dayInfo.texture_unit)
      
      const texture = caches.getTexture(device, object.day)
      device.context.bindTexture(object.day.type, texture.inner)
      updateTextureSampler(device.context, object.day, renderer.defaults.textureSampler)
    }

    if (object.night && nightInfo && nightInfo.texture_unit !== undefined) {
      device.context.activeTexture(WebGL2RenderingContext.TEXTURE0 + nightInfo.texture_unit)

      const texture = caches.getTexture(device, object.night)
      device.context.bindTexture(object.night.type, texture.inner)
      updateTextureSampler(device.context, object.night, renderer.defaults.textureSampler)
    }

    if(lerpInfo){
      device.context.uniform1f(lerpInfo.location, object.lerp)
    }

    //drawing
    device.context.bindVertexArray(gpuMesh.inner)
    if (gpuMesh.indexType !== undefined) {
      device.context.drawElements(pipeline.topology,
        gpuMesh.count,
        gpuMesh.indexType, 0
      )
    } else {
      device.context.drawArrays(pipeline.topology, 0, gpuMesh.count)
    }
  }

  /**
   * @param {WebGLRenderDevice} device
   * @param {WebGLRenderer} renderer
   */
  getRenderPipeline(device, renderer) {
    const { caches, includes, defines: globalDefines } = renderer
    if (this.pipelineId) {
      const pipeline = caches.getRenderPipeline(this.pipelineId)

      if (pipeline) {
        return pipeline
      }
    }

    /**
     * @type {WebGLRenderPipelineDescriptor}
     */
    const descriptor = {
      depthWrite: false,
      depthCompare: CompareFunction.Lequal,
      cullFace: CullFace.Front,
      topology: PrimitiveTopology.Triangles,
      vertexLayout: new MeshVertexLayout([]),
      vertex: new Shader({
        source: skyboxVertex
      }),
      fragment: {
        source: new Shader({
          source: skyboxFragment
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
    const [newRenderPipeline, newId] = caches.createRenderPipeline(device, descriptor)

    this.pipelineId = newId
    return newRenderPipeline
  }
}

/**
 * @param {WebGL2RenderingContext} context
 * @param {Texture} texture
 * @param {Sampler} sampler
 */
function updateTextureSampler(context, texture, sampler) {
  const lod = sampler.lod
  const anisotropyExtenstion = context.getExtension("EXT_texture_filter_anisotropic")

  context.texParameteri(texture.type, context.TEXTURE_MAG_FILTER, sampler.magnificationFilter)
  context.texParameteri(texture.type, context.TEXTURE_WRAP_S, sampler.wrapS)
  context.texParameteri(texture.type, context.TEXTURE_WRAP_T, sampler.wrapT)
  context.texParameteri(texture.type, context.TEXTURE_WRAP_R, sampler.wrapR)

  if (lod) {
    context.texParameteri(texture.type, context.TEXTURE_MIN_LOD, lod.min)
    context.texParameteri(texture.type, context.TEXTURE_MAX_LOD, lod.max)
  }

  if (sampler.mipmapFilter !== undefined) {
    if (sampler.minificationFilter === TextureFilter.Linear) {
      if (sampler.mipmapFilter === TextureFilter.Linear) {
        context.texParameteri(texture.type, context.TEXTURE_MIN_FILTER, context.LINEAR_MIPMAP_LINEAR);
      } else if (sampler.mipmapFilter === TextureFilter.Nearest) {
        context.texParameteri(texture.type, context.TEXTURE_MIN_FILTER, context.LINEAR_MIPMAP_NEAREST);
      }
    } else if (sampler.minificationFilter === TextureFilter.Nearest) {
      if (sampler.mipmapFilter === TextureFilter.Linear) {
        context.texParameteri(texture.type, context.TEXTURE_MIN_FILTER, context.NEAREST_MIPMAP_LINEAR);
      } else if (sampler.mipmapFilter === TextureFilter.Nearest) {
        context.texParameteri(texture.type, context.TEXTURE_MIN_FILTER, context.NEAREST_MIPMAP_NEAREST);
      }
    }
  } else {
    if (sampler.minificationFilter === TextureFilter.Nearest) {
      context.texParameteri(texture.type, context.TEXTURE_MIN_FILTER, context.NEAREST)
    } else if (sampler.minificationFilter === TextureFilter.Linear) {
      context.texParameteri(texture.type, context.TEXTURE_MIN_FILTER, context.LINEAR)
    }
  }
  if (anisotropyExtenstion) {
    context.texParameterf(texture.type, anisotropyExtenstion.TEXTURE_MAX_ANISOTROPY_EXT, sampler.anisotropy)
  }

  if (sampler.compare !== undefined) {
    context.texParameteri(texture.type, context.TEXTURE_COMPARE_MODE, context.COMPARE_REF_TO_TEXTURE);
    context.texParameteri(texture.type, context.TEXTURE_COMPARE_FUNC, sampler.compare)
  } else {
    context.texParameteri(texture.type, context.TEXTURE_COMPARE_MODE, context.NONE);
  }
}