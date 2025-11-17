/**@import { WebGLRenderPipelineDescriptor } from '../core/index.js' */
/**@import { WebGLAtttributeParams } from '../function.js' */

import { ImageRenderTarget } from "../rendertarget/index.js"
import { Texture } from "../texture/index.js"
import { Attribute, Mesh } from "../mesh/index.js"
import { FrameBuffer, GPUMesh, GPUTexture, MeshVertexLayout, WebGLRenderDevice, WebGLRenderPipeline } from "../core/index.js"
import { UniformBuffers } from "./uniformbuffers.js"
import { BufferType, BufferUsage } from "../constants/others.js"
import { getFramebufferAttachment, getWebGLTextureFormat, mapToIndicesType, mapVertexFormatToWebGL } from "../function.js"
import { assert } from "../utils/index.js"
import { getVertexFormatComponentNumber, getVertexFormatComponentSize } from "../constants/mesh.js"
import { TextureFormat } from "../constants/index.js"

export class Caches {
  uniformBuffers = new UniformBuffers()
  /**
   * @type {Map<Mesh, GPUMesh>}
   */
  meshes = new Map()
  /**
   * @type {Map<Texture, GPUTexture>}
   */
  textures = new Map()
  /**
   * @type {WebGLRenderPipeline[]}
   */
  renderpipelines = []

  /**
   * @type {Map<ImageRenderTarget, FrameBuffer>}
   */
  renderTargets = new Map()

  /**
   * @type {MeshVertexLayout[]}
   */
  meshLayouts = []

  /**
   * @param {WebGLRenderDevice} device
   * @param {ImageRenderTarget} target
   * @returns {FrameBuffer}
   */
  getFrameBuffer(device, target) {
    const current = this.renderTargets.get(target)
    if (current) {
      return current
    }

    const framebuffer = device.context.createFramebuffer()
    const depthFormat = target.internalDepthStencil || target.depthTexture?.format
    const colorAttachments = []
    const drawBuffers = target.color.map((texture, offset)=>{
      if(texture){
        return WebGL2RenderingContext.COLOR_ATTACHMENT0 + offset
      }
      return WebGL2RenderingContext.NONE
    })
    let depthBuffer

    device.context.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, framebuffer)

    for (let i = 0; i < target.color.length; i++) {
      const color = /**@type {Texture}*/ (target.color[i])
      const textColor = this.getTexture(device, color)
      device.context.framebufferTexture2D(
        WebGL2RenderingContext.FRAMEBUFFER,
        WebGL2RenderingContext.COLOR_ATTACHMENT0 + i,
        color.type,
        textColor.inner,
        0
      )
      colorAttachments[i] = textColor
    }

    if (depthFormat) {
      const webglFormat = getWebGLTextureFormat(depthFormat)

      assert(webglFormat, "No such texture format exists")

      const depth = device.context.createRenderbuffer()
      device.context.bindRenderbuffer(WebGL2RenderingContext.RENDERBUFFER, depth)
      device.context.renderbufferStorage(
        WebGL2RenderingContext.RENDERBUFFER,
        webglFormat.internalFormat,
        target.width,
        target.height
      )
      device.context.framebufferRenderbuffer(
        WebGL2RenderingContext.FRAMEBUFFER,
        getFramebufferAttachment(depthFormat),
        WebGL2RenderingContext.RENDERBUFFER,
        depth
      )
      depthBuffer = /**@type {[WebGLRenderbuffer, TextureFormat]}*/([depth, depthFormat])
    }

    const newTarget = new FrameBuffer(framebuffer, colorAttachments,drawBuffers, depthBuffer)

    this.renderTargets.set(target, newTarget)
    return newTarget
  }

  /**
   * @param {WebGLRenderDevice} device
   * @param {Mesh} mesh
   * @param {ReadonlyMap<string, Attribute>} attributes
   */
  getMesh(device, mesh, attributes) {
    const gpuMesh = this.meshes.get(mesh)
    if (gpuMesh && !mesh.changed) {
      return gpuMesh
    }

    const [layout, layoutId] = this.getLayout(mesh, attributes)
    const vao = device.context.createVertexArray()
    const newMesh = new GPUMesh(vao, 0, layoutId)

    // Flush out any change detection that happened when the mesh was creates
    mesh.changed
    // TODO: Stop leaking memory, delete old gpu buffers
    device.context.bindVertexArray(vao)
    updateVAO(device, layout, mesh, newMesh)
    this.meshes.set(mesh, newMesh)

    return newMesh
  }

  /**
   * @param {Mesh} mesh
   * @param {ReadonlyMap<string, Attribute>} attributes
   * @returns {[MeshVertexLayout, number]}
   */
  getLayout(mesh, attributes) {
    for (let i = 0; i < this.meshLayouts.length; i++) {
      const layout = /**@type {MeshVertexLayout} */(this.meshLayouts[i])
      if (layout.compatibleWithMesh(mesh)) {
        return [layout, i]
      }
    }
    const layout = MeshVertexLayout.fromMesh(mesh, attributes)
    const newId = this.meshLayouts.length

    this.meshLayouts.push(layout)

    return [layout, newId]
  }

  /**
   * @param {WebGLRenderDevice} device
   * @param {Texture} texture
   * @returns {GPUTexture}
   */
  getTexture(device, texture) {
    const gpuTexture = this.textures.get(texture)

    if (gpuTexture) {
      if (texture.changed) {
        if (
          texture.data &&
          texture.type === gpuTexture.type &&
          texture.format === gpuTexture.actualFormat &&
          texture.width === gpuTexture.width &&
          texture.height === gpuTexture.height &&
          texture.depth === gpuTexture.depth
        ) {
          // non-structural change, no need to create new gpu texture
          device.writeTexture({
            texture: gpuTexture,
            data: texture.data
          })
          return gpuTexture
        }
      } else {
        return gpuTexture
      }
    }

    // TODO: Stop leaking memory, delete old gpu textures
    const newTex = device.createTexture({
      type: texture.type,
      format: texture.format,
      width: texture.width,
      height: texture.height,
      depth: texture.depth,
      
    })

    if (texture.data) {
      device.writeTexture({
        texture: newTex,
        data: texture.data
      })
    }

    if (texture.generateMipmaps) {
      device.context.generateMipmap(texture.type)
    }

    // Flush out any change detection that happened when the image was creates
    texture.changed
    this.textures.set(texture, newTex)
    return newTex
  }

  /**
   * @param {WebGLRenderDevice} device
   * @param {WebGLRenderPipelineDescriptor} descriptor
   * @returns {[WebGLRenderPipeline, number]}
   */
  createRenderPipeline(device, descriptor) {
    const id = this.renderpipelines.length
    const pipeline = device.createRenderPipeline(descriptor)

    for (const [name, uboLayout] of pipeline.uniformBlocks) {
      const ubo = this.uniformBuffers.getorSet(device.context, name, uboLayout)
      const index = device.context.getUniformBlockIndex(pipeline.program, name)

      device.context.uniformBlockBinding(pipeline.program, index, ubo.point)
    }
    this.renderpipelines[id] = pipeline
    return [pipeline, id]
  }

  /**
   * @param {number} id
   * @returns {WebGLRenderPipeline | undefined}
   */
  getRenderPipeline(id) {
    return this.renderpipelines[id]
  }

  /**
   * @param {number} id
   */
  getMeshVertexLayout(id) {
    return this.meshLayouts[id]
  }
}

/**
 * @param {WebGLRenderDevice} device
 * @param {MeshVertexLayout} layout
 * @param {Mesh} mesh
 * @param {GPUMesh} gpuMesh
 */
function updateVAO(device, layout, mesh, gpuMesh) {
  const { indices, attributes } = mesh
  let attrCount

  // TODO: Delete the old buffers if present, probably leaking memory here
  if (indices !== undefined) {
    const buffer = device.createBuffer({
      type: BufferType.ElementArray,
      usage: BufferUsage.Static,
      size: indices.byteLength
    })
    device.writeBuffer(buffer, indices)
    gpuMesh.indexType = mapToIndicesType(indices)
    gpuMesh.indexBuffer = buffer
  }

  for (const vertexLayout of layout.layouts) {
    const attribute = vertexLayout.attributes[0]

    assert(attribute, "The mesh vertex layout is incorrectly set up for the provided mesh.")

    const data = attributes.get(attribute.name)

    assert(data, `The provided mesh does not have the vertex attribute ${attribute.name}`)

    // This only works for separate buffers for each vertex attribute.
    const buffer = device.createBuffer({
      type: BufferType.Array,
      size: data.byteLength,
      usage: BufferUsage.Static
    })
    const params = mapVertexFormatToWebGL(attribute.format)
    const count = data.byteLength / (getVertexFormatComponentSize(attribute.format) * getVertexFormatComponentNumber(attribute.format))

    device.writeBuffer(buffer, data)
    setVertexAttribute(device.context, attribute.id, params)
    gpuMesh.attributeBuffers.push(buffer)

    if (attrCount) {
      if (count < attrCount) {
        attrCount = count
      }
    } else {
      attrCount = count
    }
  }

  if (indices) {
    gpuMesh.count = indices.length
  } else if (attrCount !== undefined) {
    gpuMesh.count = attrCount
  } else {
    gpuMesh.count = 0
  }
}

/**
 * @param {WebGL2RenderingContext} context
 * @param {number} index
 * @param {WebGLAtttributeParams} params
 * @param {number} [stride = 0]
 * @param {number} [offset = 0]
 */
function setVertexAttribute(context, index, params, stride = 0, offset = 0) {
  const { type, size, normalized } = params
  context.enableVertexAttribArray(index)
  switch (type) {
    case WebGL2RenderingContext.FLOAT:
      context.vertexAttribPointer(index, size, type, normalized, stride, offset);
      break;
    case WebGL2RenderingContext.BYTE:
    case WebGL2RenderingContext.UNSIGNED_BYTE:
    case WebGL2RenderingContext.SHORT:
    case WebGL2RenderingContext.UNSIGNED_SHORT:
    case WebGL2RenderingContext.INT:
    case WebGL2RenderingContext.UNSIGNED_INT:
      if (normalized) {
        context.vertexAttribPointer(index, size, type, normalized, stride, offset);
      } else {
        context.vertexAttribIPointer(index, size, type, stride, offset);
      }
      break;
    default:
      throw new Error(`Unsupported GlDataType: ${type.toString()}`);
  }
}