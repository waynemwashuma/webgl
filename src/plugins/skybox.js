/**@import { GPUTexture, WebGLRenderPipeline, WebGLRenderPipelineDescriptor } from '../core/index.js' */
import { CompareFunction, MeshVertexLayout, Shader, WebGLRenderDevice } from "../core/index.js";
import { Matrix4 } from "../math/index.js";
import { CullFace, PrimitiveTopology, TextureFilter, TextureFormat } from "../constants/index.js";
import { Object3D, SkyBox } from "../objects/index.js";
import { Plugin, RenderItem, WebGLRenderer } from "../renderer/index.js";
import { skyboxFragment, skyboxVertex } from "../shader/index.js";
import { CuboidMeshBuilder, Mesh } from "../mesh/index.js";
import { Sampler } from "../texture/index.js";

export class SkyboxPlugin extends Plugin {

  /**
   * @type {number | undefined}
   */
  pipelineId
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
   * @param {WebGLRenderer} renderer
   */
  init(renderer) {
    renderer.uniformBinders.set(SkyBox.name, uploadUniforms)
  }

  /**
   * @override
   */
  preprocess() { }

  /**
   * @override
   * @param {Object3D} _object
   * @param {WebGLRenderDevice} _device
   * @param {WebGLRenderer} _renderer
   */
  renderObject3D(_object, _device, _renderer) { }

  /**
   * @override
   * @param {Object3D} object
   * @param {WebGLRenderDevice} device
   * @param {WebGLRenderer} renderer
   */
  getRenderItem(object, device, renderer) {
    if (!(object instanceof SkyBox)) {
      return
    }
    const mesh = renderer.caches.getMesh(device, this.cube, renderer.attributes)
    const uniforms = new SkyBoxGroup(object.lerp)
    
    if (object.day) {
      const dayTex = renderer.caches.getTexture(device, object.day)
      
      uniforms.day = dayTex
    }
    if (object.night) {
      const nightTex = renderer.caches.getTexture(device, object.night)
      
      uniforms.night = nightTex
    }
    const item = new RenderItem({
      pipelineId: this.getRenderPipeline(device, renderer),
      uniforms,
      tag: SkyBox.name,
      transform: object.transform.world,
      mesh
    })
    
    return item
  }

  /**
   * @param {WebGLRenderDevice} device
   * @param {WebGLRenderer} renderer
   */
  getRenderPipeline(device, renderer) {
    if (this.pipelineId !== undefined) {
      return this.pipelineId
    }
    const { caches, includes, defines: globalDefines } = renderer
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

    const [_, newId] = caches.createRenderPipeline(device, descriptor)

    this.pipelineId = newId
    return newId
  }
}

export class SkyBoxGroup {
  /**
   * @type {GPUTexture | undefined}
   */
  day
  /**
   * @type {GPUTexture | undefined}
   */
  night
  /**
   * @type {number}
   */
  lerp = 0

  /**
   * @param {number} lerp
   * @param {GPUTexture} [day]
   * @param {GPUTexture} [night]
   */
  constructor(lerp, day, night) {
    this.day = day
    this.night = night
    this.lerp = lerp
  }
}

/**
 * @param {WebGLRenderDevice} device
 * @param {WebGLRenderer} renderer
 * @param {WebGLRenderPipeline} pipeline
 * @param {SkyBoxGroup} bindGroup
 * @param {Matrix4} transform
 */
function uploadUniforms(device, renderer, pipeline, bindGroup, transform) {
  const { day, night, lerp } = bindGroup
  const modelInfo = pipeline.uniforms.get("model")
  const dayInfo = pipeline.uniforms.get("day")
  const nightInfo = pipeline.uniforms.get("night")
  const lerpInfo = pipeline.uniforms.get("lerp")

  if (modelInfo) {
    device.context.uniformMatrix4fv(modelInfo.location, false, new Float32Array([...transform]))
  }

  if (day && dayInfo && dayInfo.texture_unit !== undefined) {
    device.context.activeTexture(WebGL2RenderingContext.TEXTURE0 + dayInfo.texture_unit)
    device.context.bindTexture(day.type, day.inner)
    updateTextureSampler(device.context, day, renderer.defaults.textureSampler)
  }

  if (night && nightInfo && nightInfo.texture_unit !== undefined) {
    device.context.activeTexture(WebGL2RenderingContext.TEXTURE0 + nightInfo.texture_unit)
    device.context.bindTexture(night.type, night.inner)
    updateTextureSampler(device.context, night, renderer.defaults.textureSampler)
  }

  if (lerpInfo) {
    device.context.uniform1f(lerpInfo.location, lerp)
  }
}

/**
 * @param {WebGL2RenderingContext} context
 * @param {GPUTexture} texture
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