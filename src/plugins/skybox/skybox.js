/**@import { GPUTexture, WebGLRenderDevice, WebGLRenderPipeline } from '../../core/index.js' */
import { Matrix4 } from "../../math/index.js";
import { TextureFilter } from "../../constants/index.js";
import { SkyBox } from "../../objects/index.js";
import { Plugin, SortViewsNode, WebGLRenderer } from "../../renderer/index.js";
import { Sampler } from "../../texture/index.js";
import { SkyboxPipeline, SkyBoxMesh } from "./resources/index.js";
import { SkyBoxNode } from "./nodes/index.js";
import { CameraViewNode } from "../camera/index.js";

export class SkyboxPlugin extends Plugin {
  /**
   * @override
   * @param {WebGLRenderer} renderer
   */
  init(renderer) {
    renderer.setResource(new SkyboxPipeline())
    renderer.setResource(new SkyBoxMesh())
    renderer.uniformBinders.set(SkyBox.name, uploadUniforms)
    renderer.renderGraph.addNode(SkyBoxNode.name, new SkyBoxNode())
    renderer.renderGraph.addDependency(CameraViewNode.name, SkyBoxNode.name)
    renderer.renderGraph.addDependency(SkyBoxNode.name, SortViewsNode.name)
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
